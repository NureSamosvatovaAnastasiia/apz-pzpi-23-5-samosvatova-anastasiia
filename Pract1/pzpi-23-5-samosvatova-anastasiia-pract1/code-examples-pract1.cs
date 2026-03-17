using System;

public interface IShape
{
    void Draw();
}

public class Circle : IShape
{
    public void Draw()
    {
        Console.WriteLine("Намальовано коло");
    }
}
public class Rectangle : IShape
{
    public void Draw()
    {
        Console.WriteLine("Намальовано прямокутник");
    }
}

public static class ShapeFactory
{
    public static IShape CreateShape(string type)
    {
        if (type == "Circle")
        {
            return new Circle();
        }

        if (type == "Rectangle")
        {
            return new Rectangle();
        }

        throw new ArgumentException("Невідомий тип фігури");
    }
}

class Program
{
    static void Main(string[] args)
    {
        IShape shape1 = ShapeFactory.CreateShape("Circle");
        shape1.Draw();

        IShape shape2 = ShapeFactory.CreateShape("Rectangle");
        shape2.Draw();
    }
}