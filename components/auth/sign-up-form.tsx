"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signUpSchema } from "@/lib/validations/auth"
import { api } from "@/lib/trpc/client"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { mutate: createUser } = api.auth.createUser.useMutation({
    onSuccess: async () => {
      await signIn("credentials", {
        email: form.getValues("email"),
        password: form.getValues("password"),
        redirect: false,
      })
      router.push("/")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
      setIsLoading(false)
    },
  })

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true)
    createUser(values)
  }

  async function handleGithubSignIn() {
    setIsLoading(true)
    try {
      await signIn("github", { callbackUrl: "/" })
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Button variant="outline" disabled={isLoading} onClick={handleGithubSignIn}>
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
