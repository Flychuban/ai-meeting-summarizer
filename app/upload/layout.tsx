import { uploadMetadata } from "../metadata"

export const metadata = uploadMetadata

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 