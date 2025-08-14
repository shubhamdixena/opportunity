"use client"

import { useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Shield } from "lucide-react"
import { signIn, signUp } from "@/lib/actions"

function SubmitButton({ isSignUp }: { isSignUp: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isSignUp ? "Creating Account..." : "Signing In..."}
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          {isSignUp ? "Create Admin Account" : "Sign In to Admin"}
        </>
      )}
    </Button>
  )
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin")
  const [signInState, signInAction] = useActionState(signIn, null)
  const [signUpState, signUpAction] = useActionState(signUp, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form action={signInAction} className="space-y-4">
                {signInState?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {signInState.error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="signin-email" name="email" type="email" placeholder="admin@example.com" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input id="signin-password" name="password" type="password" required />
                </div>

                <SubmitButton isSignUp={false} />
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form action={signUpAction} className="space-y-4">
                {signUpState?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {signUpState.error}
                  </div>
                )}

                {signUpState?.success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    {signUpState.success}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="signup-email" name="email" type="email" placeholder="admin@example.com" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input id="signup-password" name="password" type="password" required />
                </div>

                <SubmitButton isSignUp={true} />
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
