outlets = 6;
// outlet0 = stdin
// outlet1 = stdout
// outlet2 = stderr (tape)
// outlet3 = Max control next
// outlet4 = Max control toggle
// outlet5 = debugger

var pc = 0; // program counter
var program;
var tc = 0; // tape counter
var tape = [];
var clock = 0;
var inBuf;

function bang() {
	init();
}

function stdin() {
	inBuf.concat(arrayfromargs(arguments).join(" ").trim());
}

function flush() {
	inBuf = "";
}

function init() {
	pc = 0;
	tc = 0;
	tape = [];
	clock = 0;
	outlet(5, "init()'ed");
}

function terminate() {
	pc = -1;
	outlet(4, 0); 
}

function text() {
	init();
	program = arrayfromargs(arguments).join(""); //create program string
	program = program.replace(/[^<>\+-\.,\[\]]/gim,"").trim(); //sanitise
	outlet(5, "text set");
}


function exec() {
	while(step()) {}
}

function step() {
	if(typeof program == 'undefined') {
		outlet(5, "program not initialised\n");
		terminate();
		return false;
	}
	if(pc >= program.length || pc < 0 || tc < 0) {
		outlet(5, "pc = " + pc + "; program terminated\n");
		terminate();
		
		return false;
	}
	if(program[pc] == '>') {
		tc++;
	} else if(program[pc] == '<') {
		tc--;
	} else if(program[pc] == '+') {
		if(typeof tape[tc] == 'undefined') {
			tape[tc] = 0;
		}
		tape[tc]++;
	} else if(program[pc] == '-') {
		if(typeof tape[tc] == 'undefined') {
			tape[tc] = 0;
		}
		tape[tc]--;
	} else if(program[pc] == '.') {
		if(typeof tape[tc] == 'undefined') {
			tape[tc] = 0;
		}
		// post(String.fromCharCode(tape[tc]));
		outlet(1, String.fromCharCode(tape[tc]));
	} else if(program[pc] == ',') {
		tape[tc] = inBuf.substring(0, 1).charCodeAt(0);
		inBuf = inBuf.substring(1);
	} else if(program[pc] == '[') {
		if(typeof tape[tc] == 'undefined') {
			tape[tc] = 0;
		}
		if(tape[tc] == 0) {
			var level = 1;
			while(level > 0) {
				pc++;
				if(program[pc] == '[') {
					level++;
				}				
				if(program[pc] == ']') {
					level--;
				}
			}
		}
	} else if(program[pc] == ']') {
		if(typeof tape[tc] == 'undefined') {
			tape[tc] = 0;
		} else if(tape[tc] != 0) {
			var level = 1;
			while(level > 0) {
				pc--;
				if(program[pc] == '[') {
					level--;
				}				
				if(program[pc] == ']') {
					level++;
				}
				
			}
		}
	} else {
		post("'" + program[pc] + "' is not a valid character.\n");
		terminate();
	}
	pc++;
	clock++;
	outlet(5, "(" + clock + ") " + pc + " " + program[pc] + " : (" + tc + ") " + tape);
	outlet(0, inBuf);
	outlet(2, tape);
	outlet(3, "bang");
	return true;
}
