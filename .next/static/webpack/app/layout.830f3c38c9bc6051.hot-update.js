/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/layout",{

/***/ "(app-pages-browser)/./app/components/ToastProvider.tsx":
/*!******************************************!*\
  !*** ./app/components/ToastProvider.tsx ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ }),

/***/ "(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CNextAuthProvider.tsx%22%2C%22ids%22%3A%5B%22NextAuthProvider%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CToastProvider.tsx%22%2C%22ids%22%3A%5B%22default%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Cnode_modules%5C%5Cnext%5C%5Cfont%5C%5Cgoogle%5C%5Ctarget.css%3F%7B%5C%22path%5C%22%3A%5C%22app%5C%5C%5C%5Clayout.tsx%5C%22%2C%5C%22import%5C%22%3A%5C%22Inter%5C%22%2C%5C%22arguments%5C%22%3A%5B%7B%5C%22subsets%5C%22%3A%5B%5C%22latin%5C%22%5D%7D%5D%2C%5C%22variableName%5C%22%3A%5C%22inter%5C%22%7D%22%2C%22ids%22%3A%5B%5D%7D&server=false!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CNextAuthProvider.tsx%22%2C%22ids%22%3A%5B%22NextAuthProvider%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CToastProvider.tsx%22%2C%22ids%22%3A%5B%22default%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Cnode_modules%5C%5Cnext%5C%5Cfont%5C%5Cgoogle%5C%5Ctarget.css%3F%7B%5C%22path%5C%22%3A%5C%22app%5C%5C%5C%5Clayout.tsx%5C%22%2C%5C%22import%5C%22%3A%5C%22Inter%5C%22%2C%5C%22arguments%5C%22%3A%5B%7B%5C%22subsets%5C%22%3A%5B%5C%22latin%5C%22%5D%7D%5D%2C%5C%22variableName%5C%22%3A%5C%22inter%5C%22%7D%22%2C%22ids%22%3A%5B%5D%7D&server=false! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./app/components/NextAuthProvider.tsx */ \"(app-pages-browser)/./app/components/NextAuthProvider.tsx\"));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./app/components/ToastProvider.tsx */ \"(app-pages-browser)/./app/components/ToastProvider.tsx\", 23));\n;\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/font/google/target.css?{\"path\":\"app\\\\layout.tsx\",\"import\":\"Inter\",\"arguments\":[{\"subsets\":[\"latin\"]}],\"variableName\":\"inter\"} */ \"(app-pages-browser)/./node_modules/next/font/google/target.css?{\\\"path\\\":\\\"app\\\\\\\\layout.tsx\\\",\\\"import\\\":\\\"Inter\\\",\\\"arguments\\\":[{\\\"subsets\\\":[\\\"latin\\\"]}],\\\"variableName\\\":\\\"inter\\\"}\", 23));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvYnVpbGQvd2VicGFjay9sb2FkZXJzL25leHQtZmxpZ2h0LWNsaWVudC1lbnRyeS1sb2FkZXIuanM/bW9kdWxlcz0lN0IlMjJyZXF1ZXN0JTIyJTNBJTIyRCUzQSU1QyU1Q1dFQiUyMHByb2plY3RzJTVDJTVDR2FtZVdFQiU1QyU1Q3dlYnNpdGUlNUMlNUNhcHAlNUMlNUNjb21wb25lbnRzJTVDJTVDTmV4dEF1dGhQcm92aWRlci50c3glMjIlMkMlMjJpZHMlMjIlM0ElNUIlMjJOZXh0QXV0aFByb3ZpZGVyJTIyJTVEJTdEJm1vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMkQlM0ElNUMlNUNXRUIlMjBwcm9qZWN0cyU1QyU1Q0dhbWVXRUIlNUMlNUN3ZWJzaXRlJTVDJTVDYXBwJTVDJTVDY29tcG9uZW50cyU1QyU1Q1RvYXN0UHJvdmlkZXIudHN4JTIyJTJDJTIyaWRzJTIyJTNBJTVCJTIyZGVmYXVsdCUyMiU1RCU3RCZtb2R1bGVzPSU3QiUyMnJlcXVlc3QlMjIlM0ElMjJEJTNBJTVDJTVDV0VCJTIwcHJvamVjdHMlNUMlNUNHYW1lV0VCJTVDJTVDd2Vic2l0ZSU1QyU1Q25vZGVfbW9kdWxlcyU1QyU1Q25leHQlNUMlNUNmb250JTVDJTVDZ29vZ2xlJTVDJTVDdGFyZ2V0LmNzcyUzRiU3QiU1QyUyMnBhdGglNUMlMjIlM0ElNUMlMjJhcHAlNUMlNUMlNUMlNUNsYXlvdXQudHN4JTVDJTIyJTJDJTVDJTIyaW1wb3J0JTVDJTIyJTNBJTVDJTIySW50ZXIlNUMlMjIlMkMlNUMlMjJhcmd1bWVudHMlNUMlMjIlM0ElNUIlN0IlNUMlMjJzdWJzZXRzJTVDJTIyJTNBJTVCJTVDJTIybGF0aW4lNUMlMjIlNUQlN0QlNUQlMkMlNUMlMjJ2YXJpYWJsZU5hbWUlNUMlMjIlM0ElNUMlMjJpbnRlciU1QyUyMiU3RCUyMiUyQyUyMmlkcyUyMiUzQSU1QiU1RCU3RCZzZXJ2ZXI9ZmFsc2UhIiwibWFwcGluZ3MiOiJBQUFBLG9NQUFvSjtBQUNwSjtBQUNBLG9NQUF3STtBQUN4STtBQUNBLHNiQUFnUCIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiLCB3ZWJwYWNrRXhwb3J0czogW1wiTmV4dEF1dGhQcm92aWRlclwiXSAqLyBcIkQ6XFxcXFdFQiBwcm9qZWN0c1xcXFxHYW1lV0VCXFxcXHdlYnNpdGVcXFxcYXBwXFxcXGNvbXBvbmVudHNcXFxcTmV4dEF1dGhQcm92aWRlci50c3hcIik7XG47XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiwgd2VicGFja0V4cG9ydHM6IFtcImRlZmF1bHRcIl0gKi8gXCJEOlxcXFxXRUIgcHJvamVjdHNcXFxcR2FtZVdFQlxcXFx3ZWJzaXRlXFxcXGFwcFxcXFxjb21wb25lbnRzXFxcXFRvYXN0UHJvdmlkZXIudHN4XCIpO1xuO1xuaW1wb3J0KC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCJEOlxcXFxXRUIgcHJvamVjdHNcXFxcR2FtZVdFQlxcXFx3ZWJzaXRlXFxcXG5vZGVfbW9kdWxlc1xcXFxuZXh0XFxcXGZvbnRcXFxcZ29vZ2xlXFxcXHRhcmdldC5jc3M/e1xcXCJwYXRoXFxcIjpcXFwiYXBwXFxcXFxcXFxsYXlvdXQudHN4XFxcIixcXFwiaW1wb3J0XFxcIjpcXFwiSW50ZXJcXFwiLFxcXCJhcmd1bWVudHNcXFwiOlt7XFxcInN1YnNldHNcXFwiOltcXFwibGF0aW5cXFwiXX1dLFxcXCJ2YXJpYWJsZU5hbWVcXFwiOlxcXCJpbnRlclxcXCJ9XCIpO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CNextAuthProvider.tsx%22%2C%22ids%22%3A%5B%22NextAuthProvider%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Capp%5C%5Ccomponents%5C%5CToastProvider.tsx%22%2C%22ids%22%3A%5B%22default%22%5D%7D&modules=%7B%22request%22%3A%22D%3A%5C%5CWEB%20projects%5C%5CGameWEB%5C%5Cwebsite%5C%5Cnode_modules%5C%5Cnext%5C%5Cfont%5C%5Cgoogle%5C%5Ctarget.css%3F%7B%5C%22path%5C%22%3A%5C%22app%5C%5C%5C%5Clayout.tsx%5C%22%2C%5C%22import%5C%22%3A%5C%22Inter%5C%22%2C%5C%22arguments%5C%22%3A%5B%7B%5C%22subsets%5C%22%3A%5B%5C%22latin%5C%22%5D%7D%5D%2C%5C%22variableName%5C%22%3A%5C%22inter%5C%22%7D%22%2C%22ids%22%3A%5B%5D%7D&server=false!\n"));

/***/ })

});