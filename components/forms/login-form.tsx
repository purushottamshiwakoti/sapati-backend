"use client";

import { loginSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";

import { Eye, EyeOff } from "lucide-react";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/actions/admin";

export const LoginForm = () => {
  const [isPending, startTransistion] = useTransition();
  const [viewPassword, setViewPassword] = useState(false);
  const router = useRouter();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // 1. Define your form.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof loginSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    startTransistion(() => {
      setError("");
      login(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
      });
    });
  }
  return (
    <>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email here"
                        type="email"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="relative">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter password here"
                          type={viewPassword ? "text" : "password"}
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setViewPassword(!viewPassword)}
                >
                  {viewPassword ? (
                    <Eye className="w-5 h-5 absolute right-2 top-10 " />
                  ) : (
                    <EyeOff className="w-5 h-5 absolute right-2 top-10 " />
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                Login
              </Button>
            </div>
            <div className="mt-2">
              <FormSuccess message={success} />
              <FormError message={error} />
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};
