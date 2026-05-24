"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AdminShell } from "@/components/admin/admin-shell";

type ImageItem = {
  id: number;
  title: string;
  imageUrl: string;
  type: "HERO" | "GALLERY";
  isHero: boolean;
};

const defaults = {
  title: "",
  imageUrl: "",
  type: "GALLERY",
  isHero: false,
};

export default function AdminGalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/gallery");
    const body = await response.json();
    if (response.ok) {
      setImages(body.images);
    } else {
      toast.error(body.error || "Failed to load gallery");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const createImage = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await response.json();

    if (!response.ok) {
      toast.error(body.error || "Failed to add image");
      return;
    }

    toast.success("Image added");
    setForm(defaults);
    void load();
  };

  const removeImage = async (id: number) => {
    if (!confirm("Delete this image?")) return;

    const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    const body = await response.json();

    if (!response.ok) {
      toast.error(body.error || "Failed to delete image");
      return;
    }

    toast.success("Image deleted");
    void load();
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Gallery Management</h1>
        <p className="text-sm opacity-80">Upload hero and gallery images for the guest experience.</p>
      </div>

      <form onSubmit={createImage} className="card mb-6 grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Title" value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} required />
        <input className="input md:col-span-2" placeholder="Image URL" value={form.imageUrl} onChange={(event) => setForm((state) => ({ ...state, imageUrl: event.target.value }))} required />
        <select className="input" value={form.type} onChange={(event) => setForm((state) => ({ ...state, type: event.target.value as "HERO" | "GALLERY", isHero: event.target.value === "HERO" }))}>
          <option value="GALLERY">Gallery</option>
          <option value="HERO">Hero</option>
        </select>
        <button type="submit" className="rounded-lg bg-brand-navy px-4 py-2 text-brand-paper md:col-span-4">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />Add Image
        </button>
      </form>

      {loading && <div className="h-6" />}
      {!loading && images.length === 0 && <p className="card">No images uploaded yet.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((image) => (
          <article key={image.id} className="card overflow-hidden p-0">
            <img src={image.imageUrl} alt={image.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold"><FontAwesomeIcon icon={faImage} className="mr-2 text-brand-gold" />{image.title}</p>
              <p className="text-xs opacity-70">{image.type} {image.isHero ? "(active hero)" : ""}</p>
              <button onClick={() => void removeImage(image.id)} className="mt-3 rounded border border-red-400/70 bg-red-500/10 px-3 py-1 text-sm text-red-200">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
