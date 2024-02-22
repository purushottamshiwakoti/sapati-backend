"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOffIcon } from "lucide-react";
import { changePasswordSchema } from "@/schema";
import { useGetCurrentUser } from "@/hooks/use-get-current-user";
import { changePassword } from "@/actions/admin";

export const ChangePasswordForm = () => {
  const [viewPassword, setViewPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const user = useGetCurrentUser();
  const router = useRouter();
  const [isPending, startTransistion] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      newPassword: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values);
    startTransistion(() => {
      changePassword(values, user?.email!).then((data) => {
        if (data?.error) {
          setError(data.error);
          toast.error(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          toast.success(data.success);
          router.push("/dashboard");
          router.refresh();
        }
      });
    });
  }

  return (
    <>
      <div className="flex items-center  justify-center  ">
        <div className="bg-white dark:bg-black shadow-md p-10 lg:w-[40rem] w-full rounded-3xl border-2 ">
          <h2 className="mb-4 lg:text-lg  font-bold capitalize text-center">
            You are changing your password!
          </h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-2"
            >
              <div className="space-y-4">
                <div className="relative">
                  <div>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your password here"
                              {...field}
                              type={viewPassword ? "text" : "password"}
                              disabled={isPending}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div
                    className="absolute top-[2.5rem] right-1 cursor-pointer"
                    onClick={() => setViewPassword(!viewPassword)}
                  >
                    {viewPassword ? <Eye /> : <EyeOffIcon />}
                  </div>
                </div>
                <div className="relative">
                  <div>
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter new password here"
                              {...field}
                              type={viewNewPassword ? "text" : "password"}
                              disabled={isPending}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div
                    className="absolute top-[2.5rem] right-1 cursor-pointer"
                    onClick={() => setViewNewPassword(!viewNewPassword)}
                  >
                    {viewNewPassword ? <Eye /> : <EyeOffIcon />}
                  </div>
                </div>
                <div className="relative">
                  <div>
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter confirm password here"
                              {...field}
                              type={viewConfirmPassword ? "text" : "password"}
                              disabled={isPending}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div
                    className="absolute top-[2.5rem] right-1 cursor-pointer"
                    onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                  >
                    {viewConfirmPassword ? <Eye /> : <EyeOffIcon />}
                  </div>
                </div>
                <Button type="submit" disabled={isPending}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};
