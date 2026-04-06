import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: "سهل" | "متوسط" | "صعب";
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
      answer: "المشتري",
      category: "علوم",
      difficulty: "سهل",
    },
    {
      id: 2,
      question: "كم عدد أيام السنة الميلادية؟",
      answer: "365",
      category: "عام",
      difficulty: "سهل",
    },
  ]);

  const [newQuestion, setNewQuestion] = useState<{
    question: string;
    answer: string;
    category: string;
    difficulty: "سهل" | "متوسط" | "صعب";
  }>({
    question: "",
    answer: "",
    category: "عام",
    difficulty: "متوسط",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState("الكل");

  const categories = ["الكل", "عام", "علوم", "تاريخ", "جغرافيا", "أدب"];
  const difficulties = ["سهل", "متوسط", "صعب"];

  const handleAddQuestion = () => {
    if (newQuestion.question && newQuestion.answer) {
      const question: Question = {
        id: Math.max(...questions.map((q) => q.id), 0) + 1,
        ...newQuestion,
        difficulty: newQuestion.difficulty as "سهل" | "متوسط" | "صعب",
      };
      setQuestions([...questions, question]);
      setNewQuestion({
        question: "",
        answer: "",
        category: "عام",
        difficulty: "متوسط",
      });
    }
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const filteredQuestions =
    filterCategory === "الكل"
      ? questions
      : questions.filter((q) => q.category === filterCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">بنك الأسئلة</h1>
          <p className="text-purple-100">إدارة أسئلة اللعبة</p>
        </div>

        {/* Add Question Dialog */}
        <div className="mb-8 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus size={20} />
                إضافة سؤال جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة سؤال جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل السؤال الجديد
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    السؤال
                  </label>
                  <Textarea
                    placeholder="أدخل السؤال"
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    الإجابة
                  </label>
                  <Input
                    placeholder="أدخل الإجابة"
                    value={newQuestion.answer}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        answer: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    الفئة
                  </label>
                  <Select
                    value={newQuestion.category}
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((c) => c !== "الكل").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    مستوى الصعوبة
                  </label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value) =>
                      setNewQuestion({
                        ...newQuestion,
                        difficulty: value as "سهل" | "متوسط" | "صعب",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAddQuestion}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  إضافة السؤال
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="mb-8 flex justify-center gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">لا توجد أسئلة في هذه الفئة</p>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="p-6 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      {question.question}
                    </h3>
                    <p className="text-gray-700 mb-3">
                      <span className="font-semibold">الإجابة:</span>{" "}
                      {question.answer}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                        {question.category}
                      </span>
                      <span
                        className={`px-3 py-1 rounded ${
                          question.difficulty === "سهل"
                            ? "bg-green-100 text-green-800"
                            : question.difficulty === "متوسط"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(question.id)}
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <Card className="mt-8 p-6 bg-white">
          <h3 className="text-lg font-bold mb-4">الإحصائيات</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {questions.length}
              </p>
              <p className="text-gray-600">إجمالي الأسئلة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {questions.filter((q) => q.difficulty === "سهل").length}
              </p>
              <p className="text-gray-600">أسئلة سهلة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {questions.filter((q) => q.difficulty === "صعب").length}
              </p>
              <p className="text-gray-600">أسئلة صعبة</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
