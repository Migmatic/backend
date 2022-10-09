const Sauce = require('../models/sauce');
const fs =  require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(  
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({error: error});
    }
  );
};

exports.likeSauce = (req, res, next) => {
  const likeUser = req.body;
  const like = likeUser.like;
  const userId = likeUser.userId;
  Sauce.findOne({_id: req.params.id})
      .then(sauce => {
        if(like == 0){
          if(sauce.usersLiked.indexOf(userId) != -1){
            indexId = sauce.usersLiked.indexOf(userId);
            newlikes = sauce.likes - 1;
            newUsersliked = sauce.usersLiked;
            newUsersliked.splice(indexId);
            Sauce.updateOne({ _id: req.params.id}, { ...sauce._doc, likes: newlikes,usersLiked:newUsersliked})
            .then(() => res.status(200).json({message : 'like modifié!'}))
            .catch(error => res.status(400).json({ error :"Le like n'a pas pu être retiré"})); 
          }
          else{
            indexId = sauce.usersDisliked.indexOf(userId);
            newdislikes = sauce.dislikes - 1;
            newUsersdisliked = sauce.usersDisliked;
            newUsersdisliked.splice(indexId);
            Sauce.updateOne({ _id: req.params.id}, { ...sauce._doc, dislikes: newdislikes,usersDisliked:newUsersdisliked})
            .then(() => res.status(200).json({message : 'dislike modifié!'}))
            .catch(error => res.status(400).json({ error: "Le dislike n'a pas pu être retiré" })); 
          }
        }

        if(like == 1){
          newlikes = sauce.likes + 1;
          newUsersliked = sauce.usersLiked;
          newUsersliked.push(userId);
          Sauce.updateOne({ _id: req.params.id}, { ...sauce._doc, likes: newlikes,usersLiked:newUsersliked})
          .then(() => res.status(200).json({message : 'like modifié!'}))
          .catch(error => res.status(400).json({ error:"N'a pas pu faire un like" })); 
        }

        if(like == -1){
          newDislikes = sauce.dislikes + 1
          newUsersDisliked = sauce.usersDisliked;
          newUsersDisliked.push(userId);
          Sauce.updateOne({ _id: req.params.id}, { ...sauce._doc, dislikes: newDislikes,usersDisliked:newUsersDisliked})
          .then(() => res.status(200).json({message : 'dislike modifié!'}))
          .catch(error => res.status(400).json({ error :"N'a pas pu faire un dislike"}));
        }

      })
};