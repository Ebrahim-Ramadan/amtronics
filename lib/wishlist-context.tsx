"use client"


import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { Product } from "@/lib/types"
import { toast } from "sonner"

export interface WishlistProject {
  _id: string;
  name: string;
  type: 'project';
  engineers?: any[];
  products?: import("@/lib/types").Product[];
}

export type WishlistItem = Product | WishlistProject;

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistState };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case "ADD_ITEM":
      // Prevent adding duplicates (by _id and type)
      if (state.items.find(item => item._id === action.payload._id && (item as any).type === (action.payload as any).type)) {
        return state;
      }
      // If adding a project, ensure products are included
      if ((action.payload as any).type === 'project' && !(action.payload as any).products) {
        // Try to get products from engineers if not present
        const engineers = (action.payload as any).engineers || [];
        const products = engineers.flatMap((eng: any) => (eng.bundle || []).map((b: any) => b.product).filter((p: any) => !!p));
        return { ...state, items: [...state.items, { ...action.payload, products }] };
      }
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
      };
    case "CLEAR_WISHLIST":
      return { ...state, items: [] };
    case "LOAD_WISHLIST":
      return action.payload;
    default:
      return state;
  }
};

const saveWishlistToStorage = (wishlistState: WishlistState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wishlist", JSON.stringify(wishlistState))
  }
}

const loadWishlistFromStorage = (): WishlistState | null => {
  if (typeof window !== "undefined") {
    const storedWishlist = localStorage.getItem("wishlist")
    if (storedWishlist) {
      return JSON.parse(storedWishlist)
    }
  }
  return null
}

const WishlistContext = createContext<
  { state: WishlistState; dispatch: React.Dispatch<WishlistAction> } | undefined
>(undefined)

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] })

  useEffect(() => {
    const storedWishlist = loadWishlistFromStorage()
    if (storedWishlist) {
      dispatch({ type: "LOAD_WISHLIST", payload: storedWishlist })
    }
  }, [])

  useEffect(() => {
    saveWishlistToStorage(state)
  }, [state])

  return (
    <WishlistContext.Provider value={{ state, dispatch }}>{children}</WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
} 