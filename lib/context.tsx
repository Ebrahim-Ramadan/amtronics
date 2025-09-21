"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { CartItem, Product, ProjectCartItem } from "./types"

interface CartState {
  items: (CartItem | ProjectCartItem)[]
  total: number
  language: "en" | "ar"
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "UPDATE_WELDING"; payload: { productId: string; welding: boolean } } 
  | { type: "CLEAR_CART" }
  | { type: "SET_LANGUAGE"; payload: "en" | "ar" }
  | { type: "LOAD_CART"; payload: CartState }
  | { type: "ADD_PROJECT_BUNDLE"; payload: ProjectCartItem }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => {
        if ("product" in item) {
          return item.product._id === action.payload._id
        }
        return false
      }) as CartItem | undefined
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            "product" in item && item.product._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
          total: state.total + action.payload.price,
        }
      } else {
        return {
          ...state,
          items: [...state.items, { product: action.payload, quantity: 1 , welding: false }],
          total: state.total + action.payload.price,
        }
      }
    }
    case "REMOVE_ITEM": {
      // Find if the payload matches a project-bundle or a product
      const itemToRemove = state.items.find((item) => {
        if ("type" in item && item.type === "project-bundle") {
          return item.projectId === action.payload;
        }
        if ("product" in item) {
          return item.product._id === action.payload;
        }
        return false;
      });

      return {
        ...state,
        items: state.items.filter((item) => {
          if ("type" in item && item.type === "project-bundle") {
            return item.projectId !== action.payload;
          }
          if ("product" in item) {
            return item.product._id !== action.payload;
          }
          return true;
        }),
        total: state.total - (
          itemToRemove
            ? ("type" in itemToRemove && itemToRemove.type === "project-bundle"
                ? itemToRemove.products.reduce((sum, p) => sum + p.price, 0) * itemToRemove.quantity
                : "product" in itemToRemove
                ? itemToRemove.product.price * itemToRemove.quantity
                : 0
              )
            : 0
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const item = state.items.find((item) => {
        if ("product" in item) {
          return item.product._id === action.payload.productId
        }
        return false
      }) as CartItem | undefined
      if (!item) return state
      const quantityDiff = action.payload.quantity - item.quantity
      return {
        ...state,
        items: state.items.map((item) => {
          if ("product" in item && item.product._id === action.payload.productId) {
            return { ...item, quantity: action.payload.quantity }
          }
          return item
        }),
        total: state.total + item.product.price * quantityDiff,
      }
    }
     case "UPDATE_WELDING": {
      return {
        ...state,
        items: state.items.map(item =>
          "product" in item && item.product._id === action.payload.productId
            ? { ...item, welding: action.payload.welding }
            : item
        ),
      }
    }
    case "CLEAR_CART":
      if (typeof window !== 'undefined') {
        localStorage.removeItem("amtronics_promo_code");
      }
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
    case "ADD_PROJECT_BUNDLE": {
      // Only one project bundle of the same projectId at a time
      const existing = state.items.find(
        (item) => "type" in item && item.type === "project-bundle" && item.projectId === action.payload.projectId
      ) as ProjectCartItem | undefined
      if (existing) {
        // If already in cart, just increase quantity
        return {
          ...state,
          items: state.items.map((item) =>
            "type" in item && item.type === "project-bundle" && item.projectId === action.payload.projectId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + action.payload.products.reduce((sum, p) => sum + p.price, 0) * action.payload.quantity,
        }
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
          total: state.total + action.payload.products.reduce((sum, p) => sum + p.price, 0) * action.payload.quantity,
        }
      }
    }
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
