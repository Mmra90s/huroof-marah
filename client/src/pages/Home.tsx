import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Create room state
  const [hostName, setHostName] = useState("مراح");
  const [gridSize, setGridSize] = useState("5x5");
  const [gameMode, setGameMode] = useState("grid_buzzer");
  const [rounds, setRounds] = useState("1");
  const [winRounds, setWinRounds] = useState("1");
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
        gridSize: gridSize as "5x5" | "4x4" | "3x3",
        gameMode: gameMode as "grid_buzzer" | "buzzer_only" | "grid_only",
        rounds: parseInt(rounds),
        winRounds: parseInt(winRounds),
        team1Name,
        team1Color,
        team2Name,
        team2Color,
      });
      setLocation(`/room/${result.code}/host`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const result = await joinRoomMutation.mutateAsync({
        code: roomCode,
        playerName,
        team: "team1",
      });
      setLocation(`/room/${roomCode}/player/${result.playerId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Hexagon pattern background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-6xl font-bold mb-2">
            <span className="text-yellow-300">حروف</span>
            <br />
            <span className="text-cyan-300">مع</span>
            <br />
            <span className="text-red-400">{hostName}</span>
          </div>
          <p className="text-white text-lg opacity-90 mt-4">لعبة حروف جماعية متعددة اللاعبين</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mt-8">
          <Button
            onClick={() => setShowCreateRoom(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6 rounded-full font-bold"
          >
            إنشاء غرفة
          </Button>

          <Button
            onClick={() => setShowJoinRoom(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-6 rounded-full font-bold"
          >
            الانضمام لغرفة
          </Button>

          <Button
            onClick={() => setLocation("/questions")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-full font-bold"
          >
            بنك الأسئلة
          </Button>
        </div>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-right">إنشاء غرفة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-right">
            <div>
              <Label className="text-right block mb-2">اسم مراح</Label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="أدخل اسم مراح"
                className="text-right"
              />
            </div>

            <div>
              <Label className="text-right block mb-2">حجم الشبكة</Label>
              <Select value={gridSize} onValueChange={setGridSize}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5x5">5x5</SelectItem>
                  <SelectItem value="4x4">4x4</SelectItem>
                  <SelectItem value="3x3">3x3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-right block mb-2">نمط اللعب</Label>
              <Select value={gameMode} onValueChange={setGameMode}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid_buzzer">خلية + أزرار</SelectItem>
                  <SelectItem value="buzzer_only">أزرار فقط</SelectItem>
                  <SelectItem value="grid_only">خلية فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-right block mb-2">عدد الجولات</Label>
              <Select value={rounds} onValueChange={setRounds}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">جولة واحدة</SelectItem>
                  <SelectItem value="2">جولتان</SelectItem>
                  <SelectItem value="3">ثلاث جولات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-right block mb-2">عدد جولات الفوز</Label>
              <Select value={winRounds} onValueChange={setWinRounds}>
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">جولة واحدة</SelectItem>
                  <SelectItem value="2">جولتان</SelectItem>
                  <SelectItem value="3">ثلاث جولات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-right block mb-2">اسم الفريق 1</Label>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="الفريق الأول"
                  className="text-right"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">لون الفريق 1</Label>
                <input
                  type="color"
                  value={team1Color}
                  onChange={(e) => setTeam1Color(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-right block mb-2">اسم الفريق 2</Label>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="الفريق الثاني"
                  className="text-right"
                />
              </div>
              <div>
                <Label className="text-right block mb-2">لون الفريق 2</Label>
                <input
                  type="color"
                  value={team2Color}
                  onChange={(e) => setTeam2Color(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={createRoomMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold"
            >
              {createRoomMutation.isPending ? (
                <>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الغرفة"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={showJoinRoom} onOpenChange={setShowJoinRoom}>
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-right">الانضمام لغرفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-right">
            <div>
              <Label className="text-right block mb-2">رمز الغرفة</Label>
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="أدخل رمز الغرفة"
                className="text-right text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <div>
              <Label className="text-right block mb-2">اسمك</Label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="أدخل اسمك"
                className="text-right"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={joinRoomMutation.isPending || !roomCode || !playerName}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold"
            >
              {joinRoomMutation.isPending ? (
                <>
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  جاري الانضمام...
                </>
              ) : (
                "الانضمام"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
