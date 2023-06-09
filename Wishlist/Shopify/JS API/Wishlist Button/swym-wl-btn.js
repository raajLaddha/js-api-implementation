/*
  This file contains the functions required for custom single wishlist button.
  Functions:
    handleWishListAction() - handles the wishlist actions i.e. add/remove product from list
    handleBtnStyle()       - to handle the wishlist button style on state change
    handleToast()          - to handle the toast pop-up
    getProductData()       - to fetch the details of product in PDP
    getNewLid()            - creates a new list and return the list Id
    getLid()               - to fetch the list Id of the existing wishlist
    checkProductInList()   - checks if the product is present in the list
    init()                 - runs on page load, fetches the lid, product and handles button style on initial load
*/

const wlBtn = {
    lid: null,         // to store the list Id
    product: null,     // to store the product data

    async handleWishListAction() {
        const productInList = await wlBtn.checkProductInList();

        if (productInList) {
            await wlUtil.deleteFromList(wlBtn.lid, wlBtn.product);
        } else {
            if (!wlBtn.lid) {
                wlBtn.lid = await wlBtn.getNewLid();
            }
            await wlUtil.addToList(wlBtn.lid, wlBtn.product);
        }
    },

    // handle the btn style. isAdded: specifies if the product is present in list
    handleBtnStyle(isAdded) {
        const wishlistBtns = document.getElementsByClassName("add-to-wl-btn");

        wishlistBtns.forEach((btn) => {
            if (isAdded) {
                btn.classList.add("added-to-wishlist");
                btn.innerText = "Added To Wishlist";
            } else {
                btn.classList.remove("added-to-wishlist");
                btn.innerText = "Add To Wishlist";
            }
        });
    },

    handleToast(e) {
        const productData = e.detail.d;
        const toastUI = document.getElementById("wl-toast");
        const toastText = document.getElementById("toast-text");
        const toastImage = document.getElementById("toast-image");
        const toastClose = document.getElementById("toast-close");
        const toastTimeout = setTimeout(() => {
            toastUI.style.display = "none";
        }, 3000);

        toastUI.style.display = "block";
        toastText.innerText = `${productData.dt} has been added to wishlist`;
        toastImage.setAttribute("src", productData.iu);

        toastClose.addEventListener("click", () => {
            toastUI.style.display = "none";
        });
    },

    async getProductData() {
        const url = location.href + '.json';
        const res = await fetch(url);
        const {product} = await res.json();

        return {
            epi: product.variants[0].id,
            empi: product.id,
            du: location.href
        };
    },

    async getNewLid() {
        const list = await wlUtil.createList({ lname: "My Wishlist" });
        return list.lid;
    },

    async getLid() {
        const lists = await wlUtil.fetchLists();

        if (lists.length > 0) {
            return lists[0].lid;
        }

        return null;
    },

    async checkProductInList() {
        if (!wlBtn.lid) {
            return false;
        }

        const listContents = await wlUtil.fetchListCtx({ lid: wlBtn.lid });

        for (let i = 0; i < listContents.length; ++i) {
            const { epi, empi } = listContents[i];
            if (epi == wlBtn.product.epi && empi == wlBtn.product.empi) {
                return true;
            }
        }
        return false;
    },

    async init() {
        wlUtil.load();
        wlBtn.lid = await wlBtn.getLid(); 
        wlBtn.product = await wlBtn.getProductData(); 
        const productInList = await wlBtn.checkProductInList(); 

        if (wlBtn.lid && productInList) {
            wlBtn.handleBtnStyle(true); // if product exists in list, handle the style
        }

        // handle the button style when the product is removed from wishlist
        _swat.evtLayer.addEventListener('sw:removedfromwishlist', (e) => {
            if (e.detail.d.empi === wlBtn.product.empi) {
                wlBtn.handleBtnStyle(false);
            }
        });

        // handle the button style when the product is added to wishlist 
        _swat.evtLayer.addEventListener('sw:addedtowishlist', () => wlBtn.handleBtnStyle(true));

        // handle toast when product is added to wishlist
        _swat.evtLayer.addEventListener('sw:addedtowishlist', wlBtn.handleToast);

        const wishlistBtns = document.getElementsByClassName("add-to-wl-btn");

        // add event listener and enable the wishlist button
        wishlistBtns.forEach((btn) => {
            btn.addEventListener("click", wlBtn.handleWishListAction);
            btn.style.opacity = 1;
            btn.removeAttribute("disabled");
        });
    }
};

if (!window.SwymCallbacks) {
window.SwymCallbacks = [];
}

window.SwymCallbacks.push(wlBtn.init); // call init() function when _swat object loads 

