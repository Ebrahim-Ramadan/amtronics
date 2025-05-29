"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { CartItem, Product } from "./types"

interface CartState {
  items: CartItem[]
  total: number
  language: "en" | "ar"
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LANGUAGE"; payload: "en" | "ar" }
  | { type: "LOAD_CART"; payload: CartState }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.product._id === action.payload._id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product._id === action.payload._id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
          total: state.total + action.payload.price,
        }
      } else {
        return {
          ...state,
          items: [...state.items, { product: action.payload, quantity: 1 }],
          total: state.total + action.payload.price,
        }
      }
    case "REMOVE_ITEM":
      const itemToRemove = state.items.find((item) => item.product._id === action.payload)
      return {
        ...state,
        items: state.items.filter((item) => item.product._id !== action.payload),
        total: state.total - (itemToRemove ? itemToRemove.product.price * itemToRemove.quantity : 0),
      }
    case "UPDATE_QUANTITY":
      const item = state.items.find((item) => item.product._id === action.payload.productId)
      if (!item) return state

      const quantityDiff = action.payload.quantity - item.quantity
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item,
        ),
        total: state.total + item.product.price * quantityDiff,
      }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      }
    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.payload,
      }
    case "LOAD_CART":
      return action.payload
    default:
      return state
  }
}

// Helper functions for localStorage
const saveCartToStorage = (cartState: CartState) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("amtronics_cart", JSON.stringify(cartState))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }
}

const loadCartFromStorage = (): CartState | null => {
  if (typeof window !== "undefined") {
    try {
      const savedCart = localStorage.getItem("amtronics_cart")
      if (savedCart) {
        return JSON.parse(savedCart)
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
  }
  return null
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    language: "en",
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage()
    if (savedCart) {
      dispatch({ type: "LOAD_CART", payload: savedCart })
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    saveCartToStorage(state)
  }, [state])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
