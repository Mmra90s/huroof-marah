import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HexagonalGrid } from "@/components/HexagonalGrid";
import { io, Socket } from "socket.io-client";
import { Loader2 } from "lucide-react";

export default function PlayerRoom() {
  const [, params] = useRoute("/room/:code/player/:playerId");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "";
  const playerId = params?.playerId || "";

  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState("اللاعب");
  const [team, setTeam] = useState<"team1" | "team2">("team1");
  const [teamName, setTeamName] = useState("الفريق الأول");
  const [teamColor, setTeamColor] = useState("#22c55e");
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [buzzerPressed, setBuzzerPressed] = useState(false);
  const [letters, setLetters] = useState<string[]>(Array(25).fill("ا"));
  const [owners, setOwners] = useState<(string | null)[]>(Array(25).fill(null));
  const [team1Color, setTeam1Color] = useState("#22c55e");
  const [team2ColorValue, setTeam2ColorValue] = useState("#f97316");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("game:join-room", roomCode, parseInt(playerId), playerName);
      setLoading(false);
    });

    newSocket.on("game:cell-claimed", (cellIndex, claimedTeam) => {
      if (claimedTeam === "team1") {
        setTeam1Score((prev) => prev + 1);
      } else {
        setTeam2Score((prev) => prev + 1);
      }
      setOwners((prev) => {
        const newOwners = [...prev];
        newOwners[cellIndex] = claimedTeam;
        return newOwners;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, playerId]);

  const handleBuzzer = () => {
    if (socket && !buzzerPressed) {
      setBuzzerPressed(true);
      socket.emit("game:buzzer", roomCode, parseInt(playerId));
      setTimeout(() => setBuzzerPressed(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-600 to-purple-800">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 p-4 flex flex-col" dir="rtl">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-2xl font-bold">{playerName}</h1>
            <p className="text-purple-200">الفريق: {teamName}</p>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-purple-600"
          >
            الرجوع
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Grid and Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Grid Section */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg p-4 shadow-lg h-full flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-center">الشبكة السداسية</h2>
                <div className="flex-1 flex items-center justify-center">
                  <HexagonalGrid
                    gridSize="5x5"
                    letters={letters}
                    owners={owners}
                    team1Color={team1Color}
                    team2Color={team2ColorValue}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col gap-4">
              {/* Scores */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold mb-3">النقاط</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>الفريق الأول</span>
                    <span className="text-xl font-bold text-green-600">{team1Score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الفريق الثاني</span>
                    <span className="text-xl font-bold text-orange-600">{team2Score}</span>
                  </div>
                </div>
              </div>

              {/* Round */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-bold mb-3">الجولة</h3>
                <p className="text-3xl font-bold text-center text-purple-600">{currentRound}</p>
              </div>

              {/* Team Info */}
              <div
                className="rounded-lg p-4 shadow-lg text-white"
                style={{ backgroundColor: teamColor }}
              >
                <h3 className="text-lg font-bold mb-2">فريقك</h3>
                <p className="text-center text-xl font-bold">{teamName}</p>
              </div>
            </div>
          </div>

          {/* Buzzer Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleBuzzer}
              disabled={buzzerPressed}
              className={`w-full md:w-96 h-24 text-2xl font-bold rounded-full transition-all ${
                buzzerPressed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black hover:scale-105 active:scale-95"
              }`}
            >
              {buzzerPressed ? "جاري..." : "اضغط هنا"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
