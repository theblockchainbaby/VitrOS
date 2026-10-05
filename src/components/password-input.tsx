"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return <div className="relative"><Input {...props} type={visible ? "text" : "password"} className={`pr-12 ${props.className || ""}`} /><Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-11" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button></div>;
}
