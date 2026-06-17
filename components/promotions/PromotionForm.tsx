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
})

interface PromotionFormProps {
  initialData?: Promotion
  onSuccess: () => void
}

export function PromotionForm({ initialData, onSuccess }: PromotionFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "FIXED_DISCOUNT",
      value: initialData?.value || 0,
      quantityRequired: initialData?.quantityRequired || 0,
      specialPrice: initialData?.specialPrice || 0,
      isActive: initialData?.isActive ?? true,
    },
  })

  const watchType = form.watch("type")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const url = initialData 
        ? `/api/promotions/${initialData.id}` 
        : "/api/promotions"
        
      const method = initialData ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
