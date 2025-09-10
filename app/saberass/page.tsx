'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'




export default function ClearCachePage() {
    const clearLocalStorage = () => {
        try {
            localStorage.clear()
            toast('Cache cleared')
        } catch (error) {
            toast('Error')
            console.error('Error clearing localStorage:', error)
        }
    }

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-4">Clear Browser Cache</h1>
            <p className="mb-4">Click the button below ya saber.</p>
            <Button 
                variant="destructive" 
                onClick={clearLocalStorage}
            >
                Clear Cache
            </Button>
        </div>
    )
}