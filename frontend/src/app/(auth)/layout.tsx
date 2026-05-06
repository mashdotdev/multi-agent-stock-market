import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <Image
          src={"/images/auth-image.jpg"}
          alt="auth-image"
          fill
          sizes="100vw"
          className="object-cover"
          quality={25}
        />
      </div>
      <div className="flex-1 flex items-center justify-center">{children}</div>
    </div>
  );
}
