"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Username atau password salah");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] text-black font-sans px-4">
      <div className="w-full max-w-md border-[3px] border-black bg-white p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-3 border-black bg-[#FFD400] rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <ShoppingCart className="h-7 w-7 text-black stroke-[2.5px]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-black">KASIR SEMBAKO</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mt-1.5">Masuk ke Dashboard Kasir</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Error Alert */}
          {(error || errorMessage) && (
            <div className="border-2 border-black bg-[#EF4444] text-white p-3 rounded-none font-bold text-xs uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {errorMessage || "Username atau password salah"}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-black uppercase text-black tracking-wide block">
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              placeholder="Masukkan username"
              disabled={isLoading}
              className="w-full p-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
              aria-invalid={!!errors.username}
            />
            {errors.username && (
              <p className="text-xs font-black uppercase text-red-600 mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-black uppercase text-black tracking-wide block">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Masukkan password"
              disabled={isLoading}
              className="w-full p-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:bg-zinc-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs font-black uppercase text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 border-[3px] border-black bg-[#1D4ED8] text-white font-black uppercase text-sm rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? "MASUK..." : "MASUK KE APLIKASI"}
          </button>
        </form>

        {/* Demo Account Info */}
        <div className="mt-6 border-2 border-black bg-[#FFD400] text-black font-black uppercase p-2.5 text-[10px] text-center tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <p>Akun Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}