import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function InviteUserForm({ organization, onSuccess, onCancel }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    
    setIsInviting(true);
    try {
      // Here you would typically call your backend invite function
      // For now, we'll create a UserInvitation record
      await base44.entities.UserInvitation.create({
        organization_id: organization,
        email,
        role,
        status: "pending",
        invitation_token: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });
      
      onSuccess();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      alert("Failed to send invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Email Address *</Label>
        <Input 
          required 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="user@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label>Role *</Label>
        <Select required value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Admin users can manage organization settings and other users</p>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isInviting}>
          {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isInviting ? "Sending..." : "Send Invitation"}
        </Button>
      </div>
    </form>
  );
}