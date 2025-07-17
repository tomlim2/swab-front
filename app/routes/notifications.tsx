import { json, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { supabase } from "../supabase.server";

export const loader: LoaderFunction = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, message, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Response(error.message, { status: 500 });
  return json({ notifications: data });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const message = formData.get("message");
  if (typeof message !== "string" || !message.trim()) {
    return json({ error: "Message is required" }, { status: 400 });
  }
  const { error } = await supabase.from("notifications").insert([{ message }]);
  if (error) return json({ error: error.message }, { status: 500 });
  return null;
};

export default function Notifications() {
  const { notifications } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-lg mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Weekly Notifications</h2>
      <Form method="post" className="mb-6 flex gap-2">
        <input
          name="message"
          type="text"
          placeholder="Enter notification message"
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          Add
        </button>
      </Form>
      <ul className="space-y-2">
        {notifications?.map((n: { id: string; message: string; created_at: string }) => (
          <li key={n.id} className="border rounded px-3 py-2">
            <div className="text-gray-800">{n.message}</div>
            <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 