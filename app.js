/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) { // handlebars expression, registers helpers accessible by the template
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13; // value of the Enter key
	var ESCAPE_KEY = 27; // value of the Escape key

	var util = {  // defining the variable util
		uuid: function () { //declaring the uuid function
			/*jshint bitwise:false */
			var i, random;
			var uuid = ''; // a unique id for each element

			for (i = 0; i < 32; i++) { // ok this is a for loop
				random = Math.random() * 16 | 0; // math to generate random numbers
				if (i === 8 || i === 12 || i === 16 || i === 20) { // if statement checking the number of chars
					uuid += '-'; // adding a dash symbol to the uuid in each case
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid; // printing out the uuid function
		},
		pluralize: function (count, word) { // a function to check for words that are plural
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	ecot};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({ // what the hell is this?
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () { // nameing the bindEvents method, very similar to addEventListener in PJS
			$('#new-todo').on('keyup', this.create.bind(this)); // selects any element with the id of new-todo, when there is an event type of keyup, it runs the callback function. Bind is a method on functions, creates a new function
			$('#toggle-all').on('change', this.toggleAll.bind(this));// select any element with the id of toggle all, when there is an event type of change, it runs the callback function
			$('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this)); // select any element with the id of footer, when there is an event type of click, it runs the callback function
			$('#todo-list') // the unordered list that holds all the todo items
				.on('change', '.toggle', this.toggle.bind(this)) // use event delegation to add addEventListener to parent element #todo-list
				.on('dblclick', 'label', this.edit.bind(this)) // event listener that listens for double click on label items, and then runs the edit function in L159
				.on('keyup', '.edit', this.editKeyup.bind(this)) // event listener child on parent of todo list
				.on('focusout', '.edit', this.update.bind(this)) // event listener child on parent of todo list
				.on('click', '.destroy', this.destroy.bind(this)); // event listener child on parent of todo list
		},// the above is a jQuery function called method chaining, where you call  .on and add the event listeners to the parent todo-list
		render: function () {
			var todos = this.getFilteredTodos(); // gives us an array of todos based on the fillter applied
			$('#todo-list').html(this.todoTemplate(todos)); // this is a handlebars template
			$('#main').toggle(todos.length > 0); // hides or shows the elements when todos is greateer than 0
			$('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter(); // renders the footer items to the screen
			$('#new-todo').focus(); //puts the cursor back into the new todo ara and makes it in focus
			util.store('todos-jquery', this.todos); // stores the todos in local storage in the browser
		},
		renderFooter: function () {
			var todoCount = this.todos.length; //
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('#footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked'); // locate the value of the checked property

			this.todos.forEach(function (todo) { // look through each item in the todos array and see if it is checked or not
				todo.completed = isChecked;
			});

			this.render(); // prints out the result to the screen
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) { // filter runs an action on every item in an array using a callback function
				return !todo.completed; // it return the todos where the todos that are NOT completed (the ! makes it the opposite of the property)
			});// so it is going to return the ACTIVE todos in this case, eg NOT COMPLETED
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) { // runs the filter on the function getCompletedTodos and checks for todos that are checked or completed
				return todo.completed; // returns todos that have been checked
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') { // this.filter is equal to todos that are equal to active
				return this.getActiveTodos(); // prints or returns to the screen all active todos via the getActiveTodos function
			}

			if (this.filter === 'completed') { // similar to above, but if the todos are set to completed
				return this.getCompletedTodos(); // prints out or returns all of the completed todos
			}

			return this.todos; // prints or ends the function and prints out ALL todos in the array
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos(); // take all of the active todos, todos that are NOT checked off and set it to todos.
			this.filter = 'all'; // filters out all and reset todos and returns us to the All screen in the app
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) { //
			var id = $(el).closest('li').data('id'); // the closest li tries to locate the closes li of the parent element. IN this case, and then find the value of the data id attribute
			var todos = this.todos;
			var i = todos.length;

			while (i--) { // use the while loop to pass over the Todos and check if the ID matches any of the IDs of the todos
				if (todos[i].id === id) { // check to see if the value of the todos matches the ID of the element from above
					return i; // returns that value of i
				}
			}
		},
	 	create function (e) { // method/function to create a todo
	 	var $input = $(e.taget); // sets varialbe $input to a jQuery wrapped event..... e is the ID or the element, and target is the element where the event was triggered. Inspect this in Sources to see that it is the #new-todo element in HTML
		val // .val just removes any white space entered by user
		e.which = 13 || val (''); // e.which represents the key that was typed,so does e.which = 13 (enter key) OR if there is NO VALUE at all
		return; // takes you out of the function without doing anything
		//
		}
		},

			this.todos.push({ // push adds the new object to the todos array
				id: util.uuid(), // sets the new todos item to the value of uuid
				title: val, // the title of the tododo ojbect
				completed: false // completed set to false as it is a new object
			});

			$input.val(''); // jQuery method that takes the value and sets into an emptry string

			this.render(); // prints out the result to the screen which will will be a blank todo area, and the new item added to the array and printed out below as the last item chronologically.
		},
		toggle: function (e) { //
			var i = this.indexFromEl(e.target); // grabs the id using indexFromEl
			this.todos[i].completed = !this.todos[i].completed; // once it has the ID it can access the todos array, then it flips the output
			this.render(); // prints out the result to the screen
		},
		edit: function (e) { //
			var $input = $(e.target).closest('li').addClass('editing').find('.edit'); // find the element that is clicked, then find the closed ancestor, the li, adds the CSS class 'editing' to the element, then find the descenendat that has the class edit
			$input.val($input.val()).focus(); // get input from val and set it to input of val, bring into focus,
		},
		editKeyup: function (e) { // editKeyup function for editing element
			if (e.which === ENTER_KEY) { // checks if the key presseed is equale to 13 or 27
				e.target.blur(); // if key pressed is the enter key 13, then apply blur function to any highlighted content
			}

			if (e.which === ESCAPE_KEY) { // checks if the key pressed 27,
				$(e.target).data('abort', true).blur(); // takes the element and sets the abort to true
			}
		},
		update: function (e) { // triggered by focusout event
			var el = e.target; // target is made equal to the edit.input
			var $el = $(el); // then wrap that element inside of jQuery
			var val = $el.val().trim(); // get the pure value by trimming the white space

			if (!val) { // if there is no value
				this.destroy(e); // then delete the element
				return; // leave function
			}

			if ($el.data('abort')) { // checking if the eleement is now fast
				$el.data('abort', false);
			} else { // otherwise run this code
				this.todos[this.indexFromEl(el)].title = val; // if this element is now equal to true, then save the data, use indexFromEl nd set it to the new value in the array
			}

			this.render(); // prints out the result to the screen
		},
		destroy: function (e) { // method to delete a todo
			this.todos.splice(this.indexFromEl(e.target), 1);// splice is used to delete the element. indexFromEl is trying to identify the button that has been clicked using e.target. Using break point in Console you can see the e.target is the button that is clicked to delete the todo
			this.render(); // prints out the result to the screen
		}
	};

	App.init();
});r

// My Notes
// *New feature, add a shift todo function, so you can move order via priority
// *New feature - give them a sub todo directory
// *New feature - add Flags
