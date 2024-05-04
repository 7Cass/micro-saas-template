"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { updateProfileSchema } from "../schemas";
import { toast } from "@/components/ui/use-toast";
import { updateProfile } from "../actions";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileFormProps = {
  defaultValues: Session["user"]; 
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
    }
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateProfile(data);
    router.refresh();
    ref.current?.click();
    toast({
      title: "Success",
      description: `Your profile has been updated succesfully.`,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>Enter your name here</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jon Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Enter your email here</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jondoe@example.com" readOnly {...field} />
                  </FormControl>
                  <FormDescription>Please contact us if you want to change your email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <SheetFooter className="mt-auto">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && 'Saving...'}
            {!form.formState.isSubmitting && 'Save Changes'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
