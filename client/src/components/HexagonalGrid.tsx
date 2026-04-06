import React, { useMemo } from "react";

interface HexagonalGridProps {
  letters: string[];
  owners: (string | null)[];
  gridSize: "5x5" | "4x4" | "3x3";
  team1Color: string;
  team2Color: string;
  onCellClick?: (index: number) => void;
  disabled?: boolean;
}

interface HexCell {
  index: number;
  letter: string;
  owner: string | null;
  x: number;
  y: number;
}

export const HexagonalGrid: React.FC<HexagonalGridProps> = ({
  letters,
  owners,
  gridSize,
  team1Color,
  team2Color,
  onCellClick,
  disabled = false,
}) => {
  const gridDimensions = useMemo(() => {
    const dims = {
      "5x5": { cols: 5, rows: 5 },
      "4x4": { cols: 4, rows: 4 },
      "3x3": { cols: 3, rows: 3 },
    };
    return dims[gridSize];
  }, [gridSize]);

  const hexSize = 40;
  const hexWidth = hexSize * 2;
  const hexHeight = (hexSize * Math.sqrt(3)) / 2;

  const cells = useMemo(() => {
    const result: HexCell[] = [];
    let index = 0;

    for (let row = 0; row < gridDimensions.rows; row++) {
      for (let col = 0; col < gridDimensions.cols; col++) {
        const x = col * hexWidth + (row % 2 ? hexWidth / 2 : 0);
        const y = row * hexHeight * 1.5;

        result.push({
          index,
          letter: letters[index] || "",
          owner: owners[index] || null,
          x,
          y,
        });
        index++;
      }
    }

    return result;
  }, [letters, owners, gridDimensions]);

  const width = gridDimensions.cols * hexWidth + hexWidth;
  const height = gridDimensions.rows * hexHeight * 1.5 + hexHeight;

  const getHexColor = (owner: string | null) => {
    if (owner === "team1") return team1Color;
    if (owner === "team2") return team2Color;
    return "#f3f4f6";
  };

  return (
    <div className="flex justify-center items-center p-4">
      <svg width={width} height={height} className="border border-gray-300 rounded-lg bg-white">
        {cells.map((cell) => {
          const points = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = cell.x + hexSize * Math.cos(angle);
            const py = cell.y + hexSize * Math.sin(angle);
            points.push([px, py]);
          }

          return (
            <g key={cell.index}>
              <polygon
                points={points.map((p) => p.join(",")).join(" ")}
                fill={getHexColor(cell.owner)}
                stroke="#d1d5db"
                strokeWidth="2"
                className={!disabled && onCellClick ? "cursor-pointer hover:opacity-80" : ""}
                onClick={() => !disabled && onCellClick && onCellClick(cell.index)}
              />
              <text
                x={cell.x}
                y={cell.y + 5}
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill={cell.owner ? "#ffffff" : "#1f2937"}
                className="select-none pointer-events-none"
              >
                {cell.letter}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
