/*Implement the Factory Method design pattern in C# to manage geometric shapes.
Create an IShape interface with a Draw() method and two concrete implementations: Circle and Rectangle.
Then, define an abstract ShapeCreator class that contains an abstract factory method CreateShape() and a concrete DrawShape() method that calls the factory.
Finally, implement CircleCreator and RectangleCreator and show how to use them in the Main method.*/

public interface IShape
{
    void Draw();
}

public class Circle : IShape
{
    public void Draw() => Console.WriteLine("Намальовано коло");
}

public class Rectangle : IShape
{
    public void Draw() => Console.WriteLine("Намальовано прямокутник");
}

public abstract class ShapeCreator
{
    public abstract IShape CreateShape();

    public void DrawShape()
    {
        IShape shape = CreateShape();
        shape.Draw();
    }
}

public class CircleCreator : ShapeCreator
{
    public override IShape CreateShape() => new Circle();
}

public class RectangleCreator : ShapeCreator
{
    public override IShape CreateShape() => new Rectangle();
}

class Program
{
    static void Main(string[] args)
    {
        ShapeCreator creator;

        creator = new CircleCreator();
        creator.DrawShape();

        creator = new RectangleCreator();
        creator.DrawShape();
    }
}