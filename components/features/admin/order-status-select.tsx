"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/hooks/admin/use-update-order-status";
import {
  getAllowedNextStatuses,
  getOrderStatusLabel,
  getOrderStatusVariant,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";

interface OrderStatusSelectProps {
  orderId: string;
  status: string;
}

function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const updateStatus = useUpdateOrderStatus();
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const nextStatuses = getAllowedNextStatuses(optimisticStatus);

  function applyStatus(next: OrderStatus) {
    startTransition(async () => {
      setOptimisticStatus(next);
      try {
        await updateStatus.mutateAsync({ orderId, status: next });
        toast.success(`Order marked as ${getOrderStatusLabel(next)}`);
      } catch {
        // useOptimistic falls back to the real status when the transition ends.
        toast.error("Couldn't update order status. Please try again.");
      }
    });
  }

  function handleSelect(value: string | null) {
    if (!value || !isOrderStatus(value)) return;
    if (value === "cancelled") {
      setConfirmCancelOpen(true);
      return;
    }
    applyStatus(value);
  }

  const badge = (
    <Badge variant={getOrderStatusVariant(optimisticStatus)}>
      {getOrderStatusLabel(optimisticStatus)}
    </Badge>
  );

  if (nextStatuses.length === 0) return badge;

  return (
    <div className="flex items-center gap-2">
      {badge}

      <Select value="" onValueChange={handleSelect} disabled={isPending}>
        <SelectTrigger size="sm" aria-label="Change order status">
          <SelectValue placeholder="Change status" />
        </SelectTrigger>
        <SelectContent>
          {nextStatuses.map((next) => (
            <SelectItem key={next} value={next}>
              {getOrderStatusLabel(next)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              Cancelled is final. The order can&apos;t be moved to another
              status afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Keep order
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmCancelOpen(false);
                applyStatus("cancelled");
              }}
            >
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { OrderStatusSelect };
