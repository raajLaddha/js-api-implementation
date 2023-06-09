/* 
    Utility file containing the Swym JS APIs.
    This has the Swym JS APIs converted into promises to be able to make use of async/await.
*/

const wlUtil = {
    // Denotes if `wlUtil` is loaded
    isLoaded: false,

    // Functions
    createList: null,
    fetchListCtx: null,
    addToList: null,
    deleteFromList: null,

    fetchLists() {
        return new Promise((resolve, reject) => {
            _swat.fetchLists({
                callbackFn: (lists) => resolve(lists),
                errorFn: (error) => reject(error),
            });
        });
    },

    load() {
        if (wlUtil.isLoaded) {
            return;
        }

        // promisify the _swat JS APIs
        wlUtil.createList = wlUtil.promisify(_swat.createList);
        wlUtil.fetchListCtx = wlUtil.promisify(_swat.fetchListCtx);
        wlUtil.addToList = wlUtil.promisify(_swat.addToList);
        wlUtil.deleteFromList = wlUtil.promisify(_swat.deleteFromList);

        wlUtil.isLoaded = true;
    },

    promisify(fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                fn = fn.bind(_swat);
                fn(
                    ...args,
                    (result) => resolve(result),
                    (error) => reject(error)
                );
            });
        };
    }
};

