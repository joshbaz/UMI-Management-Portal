import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClientProvider} from "@tanstack/react-query"
import { queryClient } from './utils/tanstack'
import { Toaster } from "@/components/ui/sonner";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <Toaster
        toastOptions={{
          success: {
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
        richColors
        position="top-center"
      />
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
) 