'use client'
import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CustomerInfo } from "@/lib/types";

interface SavedAddressesState {
  addresses: CustomerInfo[];
}

type SavedAddressesAction =
  | { type: "ADD_ADDRESS"; payload: CustomerInfo }
  | { type: "REMOVE_ADDRESS"; payload: string } // Assuming we might remove by some identifier like phone or a generated ID
  | { type: "LOAD_ADDRESSES"; payload: SavedAddressesState };

const SAVED_ADDRESSES_STORAGE_KEY = "amtronics_saved_addresses";

const savedAddressesReducer = (state: SavedAddressesState, action: SavedAddressesAction): SavedAddressesState => {
  switch (action.type) {
    case "ADD_ADDRESS": {
      // Prevent adding duplicates based on phone number (or another unique field)
      if (state.addresses.some(address => address.phone === action.payload.phone)) {
        return state;
      }
      // Add new address to the beginning of the array (most recent first)
      const newState = { addresses: [action.payload, ...state.addresses] };
      saveAddressesToStorage(newState);
      return newState;
    }
    case "REMOVE_ADDRESS": {
      const newState = { addresses: state.addresses.filter(address => address.phone !== action.payload) };
      saveAddressesToStorage(newState);
      return newState;
    }
    case "LOAD_ADDRESSES":
      return action.payload;
    default:
      return state;
  }
};

const saveAddressesToStorage = (addressesState: SavedAddressesState) => {
  try {
    localStorage.setItem(SAVED_ADDRESSES_STORAGE_KEY, JSON.stringify(addressesState));
  } catch (error) {
    console.error("Could not save addresses to local storage", error);
  }
};

const loadAddressesFromStorage = (): SavedAddressesState | null => {
  try {
    const storedState = localStorage.getItem(SAVED_ADDRESSES_STORAGE_KEY);
    return storedState ? (JSON.parse(storedState) as SavedAddressesState) : null;
  } catch (error) {
    console.error("Could not load addresses from local storage", error);
    return null;
  }
};

const SavedAddressesContext = createContext<{ state: SavedAddressesState; dispatch: React.Dispatch<SavedAddressesAction> } | undefined>(undefined);

export const SavedAddressesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(savedAddressesReducer, { addresses: [] });

  useEffect(() => {
    const loadedState = loadAddressesFromStorage();
    if (loadedState) {
      dispatch({ type: "LOAD_ADDRESSES", payload: loadedState });
    }
  }, []);

  return (
    <SavedAddressesContext.Provider value={{ state, dispatch }}>
      {children}
    </SavedAddressesContext.Provider>
  );
};

export const useSavedAddresses = () => {
  const context = useContext(SavedAddressesContext);
  if (context === undefined) {
    throw new Error("useSavedAddresses must be used within a SavedAddressesProvider");
  }
  return context;
}; 