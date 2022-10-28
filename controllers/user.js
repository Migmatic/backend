const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.APP_SECRET;

/** 
 * * CHECKMAIL
 * ? Vérifie que le mot de passe est suffisamment puissant
 */
 function checkPassword(field){
    // let passwordMask = /(?=.*[0-9])(?=.*[az])(?=.*[AZ])(?=.*[@#$%^&-+=() ])(?=\\S+$).{8, 20}/
    let passwordMask = /(?=.*[0-9])|(?=.*[az])|(?=.*[AZ])|(?=.*[@#$%^&-+=() ])|(?=\\S+$).{8, 20}g/
    if(passwordMask.test(field)){
      return false;
    }
    else{
      return true;
    }
  }

exports.signup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    if (checkPassword(password)) {
        res.status(400).json({message: 'Mot de passe insuffisant'});
    } 
    else {
        bcrypt.hash(password, 10)
        .then(hash => {
          const user = new User({
            email: email,
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }
  };

  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' }); 
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'FLIPFLOP',
                            { expiresIn: '1h' } // La session ne sera valide qu'une heure
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };