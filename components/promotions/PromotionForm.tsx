"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Promotion } from "@/types"

const formSchema = z.object({
  name: z.string().min(1, { message: "กรุณากรอกชื่อโปรโมชั่น" }),
  type: z.enum(["FIXED_DISCOUNT", "PERCENT_DISCOUNT", "BUNDLE"]),
  value: z.coerce.number().min(0, { message: "ค่าต้องไม่ติดลบ" }),
  quantityRequired: z.coerce.number().min(0),
  specialPrice: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
  scope: z.enum(["ALL", "CATEGORIES"]).default("ALL"),
  applicableCategories: z.array(z.string()).default([]),
})

interface PromotionFormProps {
  initialData?: Promotion
  onSuccess: () => void
}

export function PromotionForm({ initialData, onSuccess }: PromotionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/products/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "FIXED_DISCOUNT",
      value: initialData?.value || 0,
      quantityRequired: initialData?.quantityRequired || 0,
      specialPrice: initialData?.specialPrice || 0,
      isActive: initialData?.isActive ?? true,
      scope: (initialData?.applicableCategories && initialData.applicableCategories.length > 0) ? "CATEGORIES" : "ALL",
      applicableCategories: initialData?.applicableCategories || [],
    },
  })

  const watchType = form.watch("type")
  const watchScope = form.watch("scope")
  const watchApplicableCategories = form.watch("applicableCategories") || []

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    const submissionValues = {
      ...values,
      applicableCategories: values.scope === "ALL" ? [] : values.applicableCategories
    }
    
    try {
      const url = initialData 
        ? `/api/promotions/${initialData.id}` 
        : "/api/promotions"
        
      const method = initialData ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionValues),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก")
      }
      
      toast.success(initialData ? "แก้ไขโปรโมชั่นสำเร็จ" : "เพิ่มโปรโมชั่นสำเร็จ")
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
              <FormLabel>ชื่อโปรโมชั่น <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="เช่น ส่วนลดปีใหม่ 50 บาท" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภทโปรโมชั่น <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทโปรโมชั่น" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIXED_DISCOUNT">ลดราคาคงที่ (บาท)</SelectItem>
                  <SelectItem value="PERCENT_DISCOUNT">ลดเป็นเปอร์เซ็นต์ (%)</SelectItem>
                  <SelectItem value="BUNDLE">ซื้อเป็นชุดราคาพิเศษ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ขอบเขตการใช้งาน <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกขอบเขตการใช้งาน" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ALL">ใช้ได้กับสินค้าทุกรายการ (ทั้งร้าน)</SelectItem>
                  <SelectItem value="CATEGORIES">เฉพาะหมวดหมู่สินค้าที่เลือก</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchScope === "CATEGORIES" && (
          <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-dashed animate-fade-in-scale">
            <FormLabel className="text-xs font-semibold">เลือกหมวดหมู่ที่เข้าร่วมโปรโมชั่น</FormLabel>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">ไม่พบหมวดหมู่สินค้าในระบบ (กรุณาเพิ่มสินค้าที่มีหมวดหมู่ก่อน)</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pt-1">
                {categories.map((cat) => {
                  const isChecked = watchApplicableCategories.includes(cat)
                  return (
                    <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer select-none hover:bg-muted/50 p-1.5 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            form.setValue(
                              "applicableCategories",
                              watchApplicableCategories.filter((c) => c !== cat)
                            )
                          } else {
                            form.setValue("applicableCategories", [...watchApplicableCategories, cat])
                          }
                        }}
                        className="h-4 w-4 rounded border-input text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                      />
                      <span>{cat}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {watchType === "FIXED_DISCOUNT" && (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ส่วนลด (บาท) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchType === "PERCENT_DISCOUNT" && (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ส่วนลด (%) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchType === "BUNDLE" && (
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-dashed">
            <FormField
              control={form.control}
              name="quantityRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ซื้อครบ (ชิ้น) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" min="2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาพิเศษ (บาท) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="pt-4 flex justify-end gap-2 border-t">
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
