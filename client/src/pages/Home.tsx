import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, navigate] = useLocation();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"team1" | "team2">("team1");

  const [hostName, setHostName] = useState("مراح");
  const [gridSize, setGridSize] = useState<"5x5" | "4x4" | "3x3">("5x5");
  const [gameMode, setGameMode] = useState<"grid_buzzer" | "buzzer_only" | "grid_only">("grid_buzzer");
  const [rounds, setRounds] = useState(1);
  const [winRounds, setWinRounds] = useState(1);
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team1Color, setTeam1Color] = useState("#22c55e");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [team2Color, setTeam2Color] = useState("#f97316");

  const createRoomMutation = trpc.game.createRoom.useMutation();
  const joinRoomMutation = trpc.game.joinRoom.useMutation();

  const handleCreateRoom = async () => {
    try {
      const result = await createRoomMutation.mutateAsync({
        hostName,
        gridSize,
        gameMode,
        rounds,
        winRounds,
        team1Name,
        team1Color,
        team2Name,
        team2Color,
      });
      navigate(`/room/${result.code}/host`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode || !playerName) return;
    try {
      const result = await joinRoomMutation.mutateAsync({
        code: roomCode,
        playerName,
        team: selectedTeam,
      });
      navigate(`/room/${roomCode}/player/${result.playerId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">حروف مع مراح</h1>
        <p className="text-xl text-purple-100">لعبة حروف جماعية متعددة اللاعبين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
        <Button
          onClick={() => setShowCreateRoom(true)}
          className="h-32 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg"
        >
          إنشاء غرفة
        </Button>

        <Button
          onClick={() => setShowJoinRoom(true)}
          className="h-32 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg"
        >
          الانضمام لغرفة
        </Button>

        <Button
          onClick={() => navigate("/question-bank")}
          className="h-32 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg"
        >
          بنك الأسئلة
        </Button>
      </div>

      <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء غرفة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم المضيف</Label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="أدخل اسم المضيف"
                dir="rtl"
              />
            </div>
            <div>
              <Label>حجم الشبكة</Label>
              <Select value={gridSize} onValueChange={(value) => setGridSize(value as "5x5" | "4x4" | "3x3")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5x5">5x5 عادي</SelectItem>
                  <SelectItem value="4x4">4x4 سريع</SelectItem>
                  <SelectItem value="3x3">3x3 سريع جداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عدد جولات الفوز</Label>
              <Select value={winRounds.toString()} onValueChange={(value) => setWinRounds(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">جولة واحدة</SelectItem>
                  <SelectItem value="2">جولتان</SelectItem>
                  <SelectItem value="3">ثلاث جولات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={createRoomMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {createRoomMutation.isPending ? "جاري الإنشاء..." : "إنشاء الغرفة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinRoom} onOpenChange={setShowJoinRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الانضمام لغرفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>رمز الغرفة</Label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABC123"
                maxLength={6}
              />
            </div>
            <div>
              <Label>اسمك</Label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="أدخل اسمك"
                dir="rtl"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={joinRoomMutation.isPending || !roomCode || !playerName}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {joinRoomMutation.isPending ? "جاري الانضمام..." : "الانضمام"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
