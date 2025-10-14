"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { toast } from "sonner"; // Optional: npm i sonner
import { Plus, Pencil, Trash2, Users2, Code } from "lucide-react";

interface Group {
  id: string;
  groupName: string;
  groupCode: string;
  createdBy: string;
}

const AdminGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [form, setForm] = useState<Partial<Group>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateGroupCode = () =>
    Math.floor(10000000 + Math.random() * 90000000).toString();

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, "groups"));
      setGroups(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Group, "id">),
        }))
      );
    };
    fetchGroups();
  }, []);

  const updateField = (field: keyof Group, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.groupName) {
      toast.error("Please enter a group name");
      return;
    }

    const user = auth.currentUser;
    const email = user?.email || "unknown";

    if (editingId) {
      await updateDoc(doc(db, "groups", editingId), {
        groupName: form.groupName,
      });
      toast.success("Group updated successfully");
    } else {
      await addDoc(collection(db, "groups"), {
        groupName: form.groupName,
        groupCode: generateGroupCode(),
        createdBy: email,
      });
      toast.success("Group created successfully");
    }

    const snapshot = await getDocs(collection(db, "groups"));
    setGroups(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Group, "id">),
      }))
    );
    setForm({});
    setEditingId(null);
  };

  const handleEdit = (group: Group) => {
    setForm(group);
    setEditingId(group.id);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "groups", id));
    setGroups((prev) => prev.filter((g) => g.id !== id));
    toast.info("Group deleted");
    if (editingId === id) {
      setForm({});
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setForm({});
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-10 px-6 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700 flex justify-center items-center gap-2">
          <Users2 className="w-7 h-7 text-indigo-600" /> Manage Groups
        </h1>
        <p className="text-gray-600 mt-2">
          Create, update, or delete student groups effortlessly.
        </p>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="shadow-lg border-none bg-white/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-indigo-700 flex items-center gap-2">
              {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? "Edit Group" : "Create New Group"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Group Name
                </label>
                <Input
                  placeholder="Enter group name"
                  value={form.groupName || ""}
                  onChange={(e) => updateField("groupName", e.target.value)}
                  className="border-indigo-200 focus:ring-indigo-500"
                />
              </div>

              {editingId && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Group Code
                  </label>
                  <Input
                    value={form.groupCode || ""}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white"
                >
                  {editingId ? "Update Group" : "Create Group"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Groups Display Section */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {groups.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center col-span-full"
            >
              No groups created yet. Add one above 👆
            </motion.p>
          ) : (
            groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-xl transition-transform transform hover:scale-[1.02] bg-white/80 border-none backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-indigo-700 font-semibold flex items-center gap-2">
                        <Users2 className="w-5 h-5" /> {group.groupName}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Code className="w-4 h-4 text-indigo-500" />
                      <strong>Code:</strong> {group.groupCode}
                    </div>
                    <div className="text-sm">
                      <strong>Created By:</strong> {group.createdBy}
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(group)}
                        className="flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(group.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminGroups;
