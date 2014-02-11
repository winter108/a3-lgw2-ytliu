a3-lgw2-ytliu
===============

## Team Members

1. Christine Liu ytliu@uw.edu.edu
2. Lucy Williams lgw2@uw.edu

## Ultimate Frisbee Season Browser

Our final interactive data visualization allows users to explore the distributions of opponents and wins and losses for the top 20 teams during the 2012 college ultimate frisbee season. Users select a team to examine via a bubble cursor, meaning that the closest team is automatically selected. This way, users can quickly move between teams that are close to one another to facilitate comparisons of the distribution of opponents for nearby teams. All edges between the selected team and its opponents are either red or blue, where red indicates that selected team lost the game and blue indicates that the selected team won. Teams that are not part of the top 20 are invisible unless they are an opponent of the currently selected team, and are not selectable themselves.

## Running Instructions

Access our visualization at https://github.com/winter108/a3-lgw2-ytliu or download this repository and run `python -m SimpleHTTPServer 9000` and access this from http://localhost:9000/.

## Story Board

Here's a [link to our storyboard pdf file]


### Changes between Storyboard and the Final Implementation

Our final implementation matched our storyboard pretty closely. 

## Development Process

For the most part, Christine worked on application development and Lucy worked on write-ups. Lucy has a much greater familiarity with the data set and its significance, whereas Christine had more experience with web development. We both worked on data gathering and cleanup, and we collaborated in choosing the design of our visualization.
Data cleanup took up the majority of our shared time. Lucy already had the data set containing all games played during the season, but it didn't include locational data for teams. Christine used a set of tables on the USA Ultimate website to match team names to cities, and then used a a lat/long generator to match cities to locational data that could be used by by our application. But by looking at an early version of our application, Lucy could tell that some of the locational data was incorrect. For example, Tufts University was being mapped to Oregon, not Massachusetts. We knew that we didn't have time to check every single locational data point, so we just checked the top 20. Errors were present in the translation from city name to city/state pairs, so Medford was interpreted as Meford OR, not Meford MA. The data cleanup process took us about 7 hours.
We encountered a number of difficulties in developing our application. First, since we were working off of and example D3 application rather than building our own from scratch, we needed to fit our data into the exact same format as the example. This is one of the reasons why data cleanup took so much time. Second, we had a big problem with overlapping text. Since one of the major encodings in our visualization was geographic location, we were concerned that using a function like .force would put label text far away from the teams that they were supposed to be labeling, which could be confusing. We also had a problem with teams being very close to one another. It is difficult for users to intentionally select one team over another very close team. While zooming could have been a reasonable fix here, we chose not to make our map zoomable because we wanted the whole map visible at all times. Finally, we worried about a flashing effect as teams that are not part of the top 20 changed from visible to invisible or vice versa. Development of the application took us about 6 hours.
Overall, we underestimated the difficulty of developing our application, probably because we had an example that was similar to what we wanted to build. We thought that it would be simpler to change the example to what we needed than it ended up being.
  
