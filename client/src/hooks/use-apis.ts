import { apiRequest } from "@/lib/queryClient";

export async function outTrash(ids: string[]) {
  const response = await apiRequest("POST", "/api/media?Action=DeleteMedia", {
    ids: ids.map((id) => id.split("/").pop() || ""),
  });
  const data = await response.json();
  console.log("outTrash response:", data);
}
