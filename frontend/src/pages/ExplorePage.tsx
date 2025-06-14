import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Users, Star, Clock } from "lucide-react";

const categories = [
  "All",
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Photography",
];

const mockCourses = [
  {
    id: 1,
    title: "Complete React Development Course",
    description: "Learn React from basics to advanced concepts",
    instructor: "John Doe",
    rating: 4.8,
    students: 15420,
    duration: "40 hours",
    price: "$99",
    category: "Programming",
    image: "/api/placeholder/300/200",
  },
  {
    id: 2,
    title: "UI/UX Design Fundamentals",
    description:
      "Master the principles of user interface and experience design",
    instructor: "Jane Smith",
    rating: 4.9,
    students: 8750,
    duration: "25 hours",
    price: "$79",
    category: "Design",
    image: "/api/placeholder/300/200",
  },
  {
    id: 3,
    title: "Digital Marketing Mastery",
    description: "Comprehensive guide to digital marketing strategies",
    instructor: "Mike Johnson",
    rating: 4.7,
    students: 12300,
    duration: "30 hours",
    price: "$89",
    category: "Marketing",
    image: "/api/placeholder/300/200",
  },
  {
    id: 4,
    title: "Data Science with Python",
    description: "Learn data analysis and machine learning with Python",
    instructor: "Sarah Wilson",
    rating: 4.6,
    students: 9800,
    duration: "50 hours",
    price: "$120",
    category: "Data Science",
    image: "/api/placeholder/300/200",
  },
];

export function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses] = useState(mockCourses);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Courses
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover thousands of courses from expert instructors and advance
              your skills
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for courses, skills, or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {filteredCourses.length} courses found
          </h2>
          <div className="text-sm text-gray-500">Sort by: Most Popular</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>

              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <span className="text-lg font-bold text-primary-600">
                    {course.price}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-sm text-gray-600 mb-3">
                  by {course.instructor}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
