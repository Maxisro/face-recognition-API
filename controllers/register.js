const handleRegister = (req, res, db, bcrypt) => {
	const { name, email, password } = req.body;
	if (!email || !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) || !name || !password) {
		return res.status(400).json("incorrect form submition");
	}
	const hash = bcrypt.hashSync(password);
	db.transaction((trx) => {
		trx
			.insert({
				hash: hash,
				email: email,
			})
			.into("login")
			.returning("email")
			.then((loginEmail) => {
				return trx("users")
					.returning("*")
					.insert({
						email: loginEmail[0].email,
						name: name,
						joined: new Date(),
					})
					.then((user) => {
						res.json(user[0]);
					});
			})
			.then(trx.commit)
			.catch(trx.rollback);
	}).catch((err) => res.status(400).json("unable to register"));
};

module.exports = {
	handleRegister: handleRegister,
};
