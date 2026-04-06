import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HexagonalGrid } from "@/components/HexagonalGrid";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function PlayerRoom() {
  const [, params] = useRoute("/room/:code/player/:playerId");
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buzzerPressed, setBuzzerPressed] = useState(false);

  const getRoomQuery = trpc.game.getRoom.useQuery(
    { code: params?.code || "" },
    { enabled: !!params?.code }
  );

  useEffect(() => {
    if (getRoomQuery.data) {
      setRoom(getRoomQuery.data);
    }
  }, [getRoomQuery.data]);

  useEffect(() => {
    setLoading(getRoomQuery.isLoading);
  }, [getRoomQuery.isLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم يتم العثور على الغرفة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players?.find((p: any) => p.id.toString() === params?.playerId);
  const playerTeam = currentPlayer?.team === "team1" ? room.team1Name : room.team2Name;
  const playerTeamColor = currentPlayer?.team === "team1" ? room.team1Color : room.team2Color;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4" dir="rtl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">حروف مع مراح</h1>
        <p className="text-lg text-gray-300">الرمز: {room.code}</p>
      </div>

      {/* Player Info */}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <Card className="flex-1 mr-2">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">فريقك</p>
            <p
              className="text-2xl font-bold text-white"
              style={{ color: playerTeamColor }}
            >
              {playerTeam}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 mx-2">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">الجولة</p>
            <p className="text-2xl font-bold text-white">
              {room.currentRound}/{room.rounds}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 ml-2">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">النقاط</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-gray-400">{room.team1Name}</p>
                <p className="text-xl font-bold" style={{ color: room.team1Color }}>
                  {room.team1Score}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{room.team2Name}</p>
                <p className="text-xl font-bold" style={{ color: room.team2Color }}>
                  {room.team2Score}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hexagonal Grid */}
      <div className="mb-6 bg-white rounded-lg p-4">
        <HexagonalGrid
          letters={room.gameState?.gridLetters || []}
          owners={room.gameState?.gridOwners || []}
          gridSize={room.gridSize}
          team1Color={room.team1Color}
          team2Color={room.team2Color}
          disabled={true}
        />
      </div>

      {/* Buzzer Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setBuzzerPressed(!buzzerPressed)}
          className={`h-32 w-32 rounded-full text-2xl font-bold transition-all ${
            buzzerPressed
              ? "bg-red-600 hover:bg-red-700 text-white scale-95"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {buzzerPressed ? "تم الضغط!" : "اضغط للإجابة"}
        </Button>
      </div>

      {/* Players List */}
      <div className="mt-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>اللاعبون ({room.players?.length || 0}/9)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {room.players?.map((player: any) => (
                <div
                  key={player.id}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor:
                      player.team === "team1" ? room.team1Color : room.team2Color,
                    opacity: 0.2,
                  }}
                >
                  <p className="font-bold text-white">{player.name}</p>
                  <p className="text-sm text-gray-300">
                    {player.team === "team1" ? room.team1Name : room.team2Name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
