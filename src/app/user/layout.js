"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../components/Sidebar"

export default function UserLayout({ children }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.replace("/login")
    }
  }, [])

  return (
    <>
      {children}
    </>
  )
}