"use client";

import { loginAction } from "@/app/(auth)/login/action";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="mb-8 text-center">
        <CardTitle>Admin Dashboard</CardTitle>

        <CardDescription>
          Masuk menggunakan akun administrator
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          action={loginAction}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-small font-medium"
            >
              Email
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@localhost"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-small font-medium"
            >
              Password
            </label>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}