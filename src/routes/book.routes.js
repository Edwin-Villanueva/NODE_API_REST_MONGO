const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

 
//Middleware para un libro especifico

const getBook=async(req,res,next)=>{
    let book
    const {id} = req.params

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        return res.status(404).json({message : "ID Invalido"})
    }

    try {
        book = await Book.findById(id);
        if(!book){
            return res.status(404).json(
                {
                    message: "El libro no fue encontrado"
                }
            )
        }

    } catch (error) {
        res.status(500).json({message:error.message})
    }
    res.book = book
    next()
}


//obtenemos los libros [GET ALL]

router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    console.log("GET ALL", books);
    if (books.length === 0) {
      return res.status(204).json([]);
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OBTIENE UN LIBRO INDIVIDUAL POR ID [GET INDIVIDUAL]

router.get("/:id",getBook , async(req,res)=>{
  res.json(res.book)
})



// crear nuevo libro (recurso) [POST]

router.post("/", async(req, res) => {
  const { title, author, genre, date } = req?.body; // req?.body  === req && req.body ES11 (2020)
  if (!title || !author || !genre || !date) {
    return res.status(400).json({
      message: "Los campos titulo , autor , genero , y fecha son obligatorios!",
    });
  }
    const book = new Book({
      title,
      author,
      genre,
      date,
    });
    console.log("entro a post")
    try {
      
        const newBook = await book.save()
        console.log(newBook)
        res.status(201).json(newBook)
    } catch (error) {
        res.status(400).json({message : error.message})
    }
  }
);

// METODO PUT PARA MODIFICAR UNA PROPIEDAD DEL OBJETO BOOK

router.put("/:id",getBook , async(req,res)=>{
  try {
    const book = res.book;
    console.log(req.body, "acA")
    book.title = req.body.title || book.title
    book.author = req.body.author || book.author
    book.genre = req.body.genre || book.genre
    book.date =  req.body.date || book.date
    const bookUpdate = await book.save()
    res.json(bookUpdate)
    console.log(bookUpdate)
  } catch (error) {
    res.status(400).json({message : error.message})
  }
})

// BORRRAR UN LIBRO (BOOK) [DELETE]
router.delete("/:id",getBook , async(req,res)=>{
  
  try {
    const book  = res.book
    await book.deleteOne({
      _id:book._id
    });
    res.json({message : `el libro ${book.title} fue eliminado correctamente`})
    
  } catch (error) {
      res.status(500).json({message: error.message})
  }

})

module.exports =router