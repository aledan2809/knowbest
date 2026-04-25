import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a magic link to sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Magic link sent
            </CardTitle>
            <CardDescription>
              Click the link in your email to complete the sign-in process
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What's next?</strong>
              </p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Check your email inbox</li>
                <li>• Look for an email from KnowBest</li>
                <li>• Click the "Sign in" button in the email</li>
                <li>• You'll be automatically signed in</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xs text-gray-500">
                The magic link will expire in 24 hours for security reasons.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/auth/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    Go to home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Didn't receive an email? Check your spam folder or{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}