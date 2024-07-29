import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null);
const CART_KEY = 'cart';
const EMPTY_CART = {
    items: [],
    totalCount: 0,
    totalPrice: 0,
};

export default function CartProvider({ children }) {
    const initCart = getCartFromLocalStorage();
    const [cartItems, setCartItems] = useState(initCart.items);
    const [totalPrice, setTotalPrice] = useState(initCart.totalPrice);
    const [totalCount, setTotalCount] = useState(initCart.totalCount);

    useEffect(() => {
        const totalPrice = sum(cartItems.map(item => item.price));
        const totalCount = sum(cartItems.map(item => item.quantity));
        setTotalPrice(totalPrice);
        setTotalCount(totalCount);

        localStorage.setItem(
            CART_KEY,
            JSON.stringify({
                items: cartItems,
                totalPrice,
                totalCount,
            })
        )
    }, [cartItems]);

    function getCartFromLocalStorage() {
        const storedCart = localStorage.getItem(CART_KEY);
        return storedCart ? JSON.parse(storedCart) : EMPTY_CART;
    }

    const sum = items => {
        return items.reduce((prevValue, curValue) => prevValue + curValue, 0);
    };

    const removeFromCart = foodId => {
        const filteredCartItems = cartItems.filter(item => item.food.id !== foodId);
        setCartItems(filteredCartItems);
    };


    const changeQuantity = (cartItem, newQuantity) => {
        const { food } = cartItem;

        const changeCartItem = {
            ...cartItem,
            quantity: newQuantity,
            price: food.price * newQuantity,
        };

        setCartItems(
            cartItems.map(item => (item.food.id === food.id ? changeCartItem : item))
        );
    };

    const addToCart = food => {
        const carItem = cartItems.find(item => item.food.id === food.id);
        if (carItem) {
            changeQuantity(carItem, carItem.quantity + 1);
        } else {
            setCartItems([...cartItems, { food, quantity: 1, price: food.price }]);
        }
    };

    const clearCart = () => {
        localStorage.removeItem(CART_KEY);
        const { items, totalPrice, totalCount } = EMPTY_CART;
        setCartItems(items);
        setTotalPrice(totalPrice);
        setTotalCount(totalCount);
    };

    return <CartContext.Provider
        value={{
            cart: { items: cartItems, totalPrice, totalCount },
            removeFromCart,
            changeQuantity,
            addToCart,
            clearCart,
        }}>
        {children}
    </CartContext.Provider>
}

export const useCart = () => useContext(CartContext);