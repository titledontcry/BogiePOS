"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Product } from "@/types"

const formSchema = z.object({
  name: z.string().min(1, { message: "กรุณากรอกชื่อสินค้า" }),
  category: z.string().min(1, { message: "กรุณากรอกหมวดหมู่" }),
  price: z.coerce.number().min(0, { message: "ราคาต้องไม่ติดลบ" }),
  costPrice: z.coerce.number().min(0, { message: "ต้นทุนต้องไม่ติดลบ" }),
  stock: z.coerce.number().min(0, { message: "สต๊อกต้องไม่ติดลบ" }),
  barcode: z.string().optional(),
})

interface ProductFormProps {
  initialData?: Product
  onSuccess: () => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "เสื้อผ้า",
      price: initialData?.price || 0,
      costPrice: initialData?.costPrice || 0,
      stock: initialData?.stock || 0,
      barcode: initialData?.barcode || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const url = initialData 
        ? `/api/products/${initialData.id}` 
        : "/api/products"
        
      const method = initialData ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          barcode: values.barcode?.trim() === "" ? null : values.barcode
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก")
      }
      
      toast.success(initialData ? "แก้ไขสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ")
      onSuccess()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อสินค้า <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="เช่น เสื้อยืดคอกลม สีดำ M" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมวดหมู่ <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="เช่น เสื้อผ้า, กางเกง" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ราคาขาย (฿) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ต้นทุน (฿)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวนสต๊อก (ชิ้น) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>บาร์โค้ด</FormLabel>
                <FormControl>
                  <Input placeholder="สแกนหรือพิมพ์บาร์โค้ด" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
