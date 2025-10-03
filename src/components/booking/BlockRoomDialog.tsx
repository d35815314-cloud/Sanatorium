import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Room } from "@/types/booking";
import { AlertTriangle, Lock, Unlock } from "lucide-react";

interface BlockRoomDialogProps {
  room?: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockRoom: (roomId: string, reason: string) => void;
  onUnblockRoom: (roomId: string) => void;
}

export default function BlockRoomDialog({
  room = null,
  isOpen = false,
  onClose = () => {},
  onBlockRoom = () => {},
  onUnblockRoom = () => {},
}: BlockRoomDialogProps) {
  const [blockReason, setBlockReason] = useState("");

  const handleSubmit = () => {
    console.debug("[SAFE-FIX] BlockRoomDialog.handleSubmit called", {
      roomId: room?.id,
      isBlocked: room?.blocked,
      blockReason: blockReason.trim(),
    });
    if (!room) return;

    if (room.blocked) {
      console.debug("[SAFE-FIX] Calling onUnblockRoom", { roomId: room.id });
      onUnblockRoom(room.id);
      handleClose();
    } else {
      if (!blockReason.trim()) {
        alert("Пожалуйста, укажите причину блокировки");
        return;
      }
      console.debug("[SAFE-FIX] Calling onBlockRoom", {
        roomId: room.id,
        reason: blockReason.trim(),
      });
      onBlockRoom(room.id, blockReason.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setBlockReason("");
    onClose();
  };

  if (!room) return null;

  const isBlocked = room.blocked;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <>
                <Unlock className="w-5 h-5 text-green-600" />
                Разблокировать номер {room.number}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-red-600" />
                Заблокировать номер {room.number}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isBlocked ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Номер заблокирован</span>
              </div>
              {room.blockReason && (
                <div className="text-sm text-yellow-700">
                  <strong>Причина:</strong> {room.blockReason}
                </div>
              )}
              {room.blockedAt && (
                <div className="text-sm text-yellow-700">
                  <strong>Дата блокировки:</strong>{" "}
                  {room.blockedAt.toLocaleDateString("ru-RU")}
                </div>
              )}
              <p className="text-sm text-yellow-700 mt-2">
                Вы уверены, что хотите разблокировать этот номер?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Внимание!</span>
                </div>
                <p className="text-sm text-red-700">
                  После блокировки номер будет недоступен для бронирования до
                  разблокировки.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Причина блокировки *
                </label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Укажите причину блокировки номера..."
                  rows={3}
                  className="resize-none"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isBlocked && !blockReason.trim()}
            variant={isBlocked ? "default" : "destructive"}
          >
            {isBlocked ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Разблокировать
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Заблокировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
