import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { HexagonalGrid } from "@/components/HexagonalGrid";
import { io, Socket } from "socket.io-client";

interface HostRoomProps {
  roomCode: string;
}

export default function HostRoom() {
  const [, params] = useRoute("/room/:code/host");
  const [, setLocation] = useLocation();
  const roomCode = params?.code || "";

  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [gridLetters, setGridLetters] = useState<string[]>([]);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [lastBuzzer, setLastBuzzer] = useState<{ playerId: number; playerName: string } | null>(null);
  const [letters, setLetters] = useState<string[]>(Array(25).fill("ا"));
  const [owners, setOwners] = useState<(string | null)[]>(Array(25).fill(null));

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
      newSocket.emit("game:join-room", roomCode, 0, "Host");
    });

    newSocket.on("game:player-joined", (data) => {
      setPlayers((prev) => [...prev, data]);
    });

    newSocket.on("game:buzzer-pressed", (data) => {
      setLastBuzzer({ playerId: data.playerId, playerName: "" });
    });

    newSocket.on("game:cell-claimed", (data) => {
      const { cellIndex, team } = data;
      if (team === "team1") {
        setTeam1Score((prev) => prev + 1);
      } else {
        setTeam2Score((prev) => prev + 1);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode]);

  const handleResetGrid = () => {
    setTeam1Score(0);
    setTeam2Score(0);
    setLastBuzzer(null);
  };

  const handleNextRound = () => {
    setCurrentRound((prev) => prev + 1);
    setLastBuzzer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-purple-200">الكود: {roomCode}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">الشبكة السداسية</h2>
              <HexagonalGrid
                gridSize="5x5"
                letters={letters}
                owners={owners}
                team1Color="#22c55e"
                team2Color="#f97316"
                disabled
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Scores */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">النقاط</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg">الفريق الأول</span>
                  <span className="text-2xl font-bold text-green-600">{team1Score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg">الفريق الثاني</span>
                  <span className="text-2xl font-bold text-orange-600">{team2Score}</span>
                </div>
              </div>
            </div>

            {/* Current Round */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">الجولة الحالية</h3>
              <p className="text-3xl font-bold text-center text-purple-600">{currentRound}</p>
            </div>

            {/* Last Buzzer */}
            {lastBuzzer && (
              <div className="bg-yellow-100 rounded-lg p-6 shadow-lg border-2 border-yellow-400">
                <h3 className="text-lg font-bold mb-2">آخر ضغطة</h3>
                <p className="text-center text-xl font-bold">{lastBuzzer.playerName}</p>
              </div>
            )}

            {/* Controls */}
            <div className="space-y-2">
              <Button
                onClick={handleResetGrid}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2"
              >
                إعادة تعيين
              </Button>
              <Button
                onClick={handleNextRound}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2"
              >
                الجولة التالية
              </Button>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4">اللاعبون ({players.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {players.map((player) => (
                  <div key={player.id} className="text-sm p-2 bg-gray-100 rounded">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
