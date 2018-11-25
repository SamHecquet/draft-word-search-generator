const { wordfind } = require('./wordfind')

$(document).ready(() => {
  generatePuzzle()
})

$('#copy')
  .off('click')
  .on('click', () => {
    let $temp = $('<textarea>');
    $('body').append($temp);
    var brRegex = /<br\s*[\/]?>/gi;
    $temp.val($('#content').text().replace(brRegex, "\r\n")).select()
    document.execCommand('copy');
    $temp.remove()
  })

const generatePuzzle = (event) => {
  $('#word')
    .off('submit')
    .on('submit', async (e) => {
      $('#content').html('generating...')
      cleanAllErrorMessages()
      e.preventDefault()
      let errors = false
      const form = $('#word')
      var formData = {};
      form.serializeArray().map(x => {formData[x.name] = x.value;})
      console.log(formData)

      // check if all values are provided
      // $('#word input, #word select, #word textarea').each(() => {
      //   if (!$(this).hasClass('optional') && $(this).val() === '') {
      //     addErrorMessage($(this).parent(), 'This field is mandatory')
      //     errors = true
      //   }
      // })
      $('#word input, #word select, #word textarea').each(
        function() {
          if (!$(this).hasClass('optional') && $(this).val() == '') {
            addErrorMessage($(this).parent(), 'This field is mandatory')
            errors = true
          }
        }
      )

      // read File
      var dirtyWordList = []
      const wordsfile = document.getElementById("words-list").files[0];
      if (document.getElementById("dirty-words-list").files.length !== 0) {
        var dirtyWordsfile = document.getElementById("dirty-words-list").files[0];
      } else {
        var dirtyWordList = await fetch('../public-csv/short-bad-words.csv').then(function(response) {
            if (response.status !== 200) {
                throw response.status;
            }
            return response.text();
        }).then(function(content) {
          // TODO remove spaces, number, -
          // TOD: handle empty list
            return content.replace(' ', '')
            .split('\n')
        }).catch(function(status) {
            console.log('Error ' + status);
        });
      }
      console.log(dirtyWordList)
      if (!errors) {
        const wordList = await readFile(wordsfile)
        if (dirtyWordList.length === 0) {
          dirtyWordList = await readFile(dirtyWordsfile)
        }
        
        const options = {
          height: formData['column-number'],
          width: formData['row-number'],
          maxAttempts: 10,
        }
        const drawingOptions = {
          height: formData.height,
          width: formData.width,
          fontSize: formData['font-size'],
          // TODO: handle typo
          fontName: formData['font-name'],
          fontColor: formData['font-color'],
          backgroundColor: formData['background-color'],
          letterSpacing: formData['letter-spacing'],
          lineHeight: formData['line-height'],
          fileName: formData['filename'],
        }
        console.log(drawingOptions)
        console.log(dirtyWordList)
        var i = 0;
        let tooManyErrors = false
        let tooSmall = false
        do {
          try {
            var puzzle = wordfind.newPuzzleLax(wordList, options)
          } catch (err) {
            tooSmall = true;
            break;
          }
          i++;
          if (i === 50) {
            tooManyErrors = true;
            break;
          }
        } while (wordfind.solve(puzzle, dirtyWordList).found.length !== 0)

        if (tooSmall) {
          $('#content').html(
            `No valid ${options.width}x${options.height} grid found`)
        } else {
          console.log(wordfind.solve(puzzle, dirtyWordList).found);
          if (tooManyErrors) {
            $('#content').html(
              `Dirty many words found, for instance the lasts were: ${wordfind.solve(puzzle, dirtyWordList).found.map(wordFound => ` "${wordFound.word}"`)}`)
          } else {
            drawPuzzle($('#content'), puzzle, drawingOptions)
          }
          
          wordfind.print(puzzle)
        }
      }
    })
}

const drawPuzzle = (target, puzzle, drawingOptions = {}) => {
  $(target).html()
  const { fontName, fontColor, backgroundColor, fileName } = drawingOptions
  var puzzleHeight = puzzle.length
  const fontSize = parseInt(drawingOptions.fontSize)
  const letterSpacing = parseInt(drawingOptions.letterSpacing)
  const lineHeight = parseInt(drawingOptions.lineHeight)
  let space = 20
  const spaceHeight = lineHeight + fontSize
  const spaceWidth = letterSpacing + fontSize
  let maxHeight = parseInt(drawingOptions.height) - spaceHeight
  const sizeHeight = drawingOptions.height
  const width = drawingOptions.width
  // for each row in the puzzle
  let puzzleString = `
def RGBfromHex(hex):<br>
  h = hex.lstrip('#')<br>
  RGB = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))<br>
  r1, g1, b1 = RGB[0] / 255, RGB[1] / 255, RGB[2] / 255<br>
  return(r1, g1, b1)<br>
newPage(${width}, ${sizeHeight})
font("${fontName}", ${fontSize})<br>
#if you want to use a personal font, it should be <br>
#font("/path/to/${fontName}.otf", 25)<br>
fill(*RGBfromHex("${backgroundColor}"))<br>
# x, y, width and height
rect(0, 0, width(), height())<br>

fill(*RGBfromHex("${fontColor}"))<br>
  `
  var currentHeight = 0
  console.log(puzzle)
  var newPuzzle = puzzle.reverse()
  console.log(newPuzzle)

  for (var i = 0, puzzleHeight; i < puzzleHeight; i++) {
    maxHeight -= spaceHeight
    let row = newPuzzle[i]
    let x = spaceWidth
    // for each element in that row
    for (let j = 0, width = row.length; j < width; j++) {
      // x, y, width and height
      puzzleString += `
textBox("${row[j]}", (${x}, ${maxHeight}, ${spaceWidth}, ${spaceHeight}), align="center") <br>`
      x += spaceWidth
    }
    // close our row
    puzzleString += `
<br><br><br>
    `
  }
  puzzleString += `
#saveImage("/path/to/directory/to/export/${fileName})<br>
  `
  $(target).html(puzzleString)
}

const addErrorMessage = (target, message) => {
  target.after(`<span class="error">${message}</span>`)
  target.addClass('input__error')
}

const cleanAllErrorMessages = () => {
  $('#word span.error').remove()
  $('#word .input__error').removeClass('input__error')
}

const readFile = (file) => new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.onload = function(e) {
      // create an array from the CSV file
      // TODO remove spaces, number, -
      // TOD: handle empty list
      resolve(
        e.target.result
        .replace(' ', '')
        .split('\n')
      );
    };
    reader.onerror = reader.onabort = reject;
    reader.readAsText(file);
});
