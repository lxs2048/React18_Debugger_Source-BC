/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import ReactVersion from "shared/ReactVersion";

import {
  createRequest,
  startWork,
  startFlowing,
  abort,
} from "react-server/src/ReactFizzServer";

import {
  createResponseState,
  createRootFormatContext,
} from "react-dom-bindings/src/server/ReactDOMServerFormatConfig";

// TODO: Move to sub-classing ReadableStream.

function renderToReadableStream(children, options) {
  return new Promise((resolve, reject) => {
    let onFatalError;
    let onAllReady;
    const allReady = new Promise((res, rej) => {
      onAllReady = res;
      onFatalError = rej;
    });

    function onShellReady() {
      const stream = new ReadableStream(
        {
          type: "direct",
          pull: (controller) => {
            // $FlowIgnore
            startFlowing(request, controller);
          },
          cancel: (reason) => {
            abort(request);
          },
        },
        // $FlowFixMe[prop-missing] size() methods are not allowed on byte streams.
        { highWaterMark: 2048 }
      );
      // TODO: Move to sub-classing ReadableStream.
      stream.allReady = allReady;
      resolve(stream);
    }
    function onShellError(error) {
      // If the shell errors the caller of `renderToReadableStream` won't have access to `allReady`.
      // However, `allReady` will be rejected by `onFatalError` as well.
      // So we need to catch the duplicate, uncatchable fatal error in `allReady` to prevent a `UnhandledPromiseRejection`.
      allReady.catch(() => {});
      reject(error);
    }
    const request = createRequest(
      children,
      createResponseState(
        options ? options.identifierPrefix : undefined,
        options ? options.nonce : undefined,
        options ? options.bootstrapScriptContent : undefined,
        options ? options.bootstrapScripts : undefined,
        options ? options.bootstrapModules : undefined,
        options ? options.unstable_externalRuntimeSrc : undefined
      ),
      createRootFormatContext(options ? options.namespaceURI : undefined),
      options ? options.progressiveChunkSize : undefined,
      options ? options.onError : undefined,
      onAllReady,
      onShellReady,
      onShellError,
      onFatalError
    );
    if (options && options.signal) {
      const signal = options.signal;
      if (signal.aborted) {
        abort(request, signal.reason);
      } else {
        const listener = () => {
          abort(request, signal.reason);
          signal.removeEventListener("abort", listener);
        };
        signal.addEventListener("abort", listener);
      }
    }
    startWork(request);
  });
}

function renderToNodeStream() {
  throw new Error(
    "ReactDOMServer.renderToNodeStream(): The Node Stream API is not available " +
      "in Bun. Use ReactDOMServer.renderToReadableStream() instead."
  );
}

function renderToStaticNodeStream() {
  throw new Error(
    "ReactDOMServer.renderToStaticNodeStream(): The Node Stream API is not available " +
      "in Bun. Use ReactDOMServer.renderToReadableStream() instead."
  );
}

export {
  renderToReadableStream,
  renderToNodeStream,
  renderToStaticNodeStream,
  ReactVersion as version,
};
