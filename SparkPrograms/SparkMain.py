from datetime import datetime, timedelta
from pyspark.sql.functions import udf
from pyspark.sql.types import TimestampType


# Get full text of tweet
def getFullText(retweeted_status, quoted_status, text, extended_tweet):
    if retweeted_status is not None:
        if retweeted_status['truncated']:
            return retweeted_status['extended_tweet']['full_text']
        return retweeted_status['text']
    elif quoted_status is not None:
        if quoted_status['truncated']:
            return text + ":" + quoted_status['extended_tweet']['full_text']
        return quoted_status['text']
    else:
        if extended_tweet is None:
            return text
        return extended_tweet['full_text']


# Gets hastags
def hashtagExtractor(hashtags):
    if len(hashtags) == 0:
        return ""
    else:
        tags = ""
        for hashtag in hashtags:
            tags = tags + hashtag[1] + " "
        return tags.strip()


# Gets top 10 trending hashtags in the last 60 minutes
def getTrendingHashtags(tweets, output, csv_output, date_str):
    hashtag_dict = {}
    output.write("Top ten trending hashtags at " + date_str + "\n")
    print("Top ten trending hashtags at " + date_str)
    for tweet in tweets:
        if tweet['hashtags'] != "":
            hashtags = tweet['hashtags'].split()
            for hashtag in hashtags:
                if hashtag in hashtag_dict.keys():
                    hashtag_dict[hashtag] = hashtag_dict[hashtag] + 1
                else:
                    hashtag_dict[hashtag] = 1
    count = 1
    for hashtag in sorted(hashtag_dict, key=hashtag_dict.get, reverse=True):
        csv_output.write(date_str[4:15] + "," + date_str[16:34] + ",#" + hashtag + "," + str(hashtag_dict[hashtag]) + "\n")
        output.write(str(count) + ". #" + hashtag + " " + str(hashtag_dict[hashtag]) + "\n")
        print(str(count) + ". #" + hashtag + " " + str(hashtag_dict[hashtag]))
        count = count + 1
        if count == 11:
            return


# Gets top 10 keywords in the last 60 minutes
def getKeywords(tweets, output, csv_output, date_str):
    keyword_dict = {}
    output.write("Top ten keywords at " + date_str + "\n")
    print("Top ten keywords at " + date_str)
    # Stop words. Same list as in P1
    stop_words = ["how", "after", "a", "with", "the", "in", "then", "out",
                  "which", "how's", "what", "when", "what's", "of",
                  "he", "she", "he's", "she's", "this", "that", "but",
                  "by", "at", "are", "and", "an", "as", "am", "i", "i've",
                  "any", "aren't", "be", "been", "being", "because", "can't",
                  "cannot", "could", "couldn't", "did", "didn't", "do", "does",
                  "doesn't", "don't", "doing", "for", "from", "has", "hasn't", "had",
                  "hadn't", "have", "haven't", "him", "her", "he'd", "he'll",
                  "his", "i'm", "i'll", "i'd", "if", "is", "isn't", "it", "it's",
                  "its", "let's", "or", "on", "other", "she'd", "she'll", "should",
                  "shouldn't", "so", "such", "that's", "they", "they're", "they've",
                  "their", "theirs", "this", "those", "to", "too", "very", "was",
                  "wasn't", "we", "we're", "we've", "we'll", "were", "weren't",
                  "when's", "where", "where's", "will", "who", "who's", "why",
                  "why's", "would", "wouldn't", "won't", "you", "your", "you'd",
                  "you'll", "you've", "yours", "me"]
    for tweet in tweets:
        words = tweet['full_text'].split()
        for word in words:
            word1 = word.lower().replace("!", "").replace(".", "").replace("?", "").replace("\"", "").strip()
            if word1 not in stop_words and word1 in keyword_dict.keys():
                keyword_dict[word1] = keyword_dict[word1] + 1
            else:
                keyword_dict[word1] = 1
    count = 1
    for word in sorted(keyword_dict, key=keyword_dict.get, reverse=True):
        print(str(count) + ". " + word + " " + str(keyword_dict[word]))
        try:
            output.write(str(count) + ". " + word + " " + str(keyword_dict[word]) + "\n")
            csv_output.write(date_str[4:15] + "," + date_str[16:34] + "," + word + "," + str(keyword_dict[word]) + "\n")
        except UnicodeEncodeError:
            output.write(str(count) + ". emoji :) " + str(keyword_dict[word]) + "\n")
            csv_output.write(date_str[4:15] + "," + date_str[16:34] + ",emoji[:)]," + str(keyword_dict[word]) + "\n")
        count = count + 1
        if count == 11:
            return


# Get count of certain words
def countWords(tweets, output, csv_output, date_str):
    word_dict = {'trump': 0, 'flu': 0, 'zika': 0, 'diarrhea': 0, 'ebola': 0, 'headache': 0, 'measles': 0}
    output.write("Word occurrences at " + date_str + "\n")
    print("Word occurrences at " + date_str)
    for tweet in tweets:
        words = tweet['full_text'].split()
        for word in words:
            word1 = word.lower().replace("'", "").replace("!", "").replace(".", "").replace("?", "")\
                .replace("\"", "").strip()
            if word1 in word_dict.keys():
                word_dict[word1] = word_dict[word1] + 1
    count = 1
    for word in sorted(word_dict, key=word_dict.get, reverse=True):
        output.write(str(count) + ". " + word + " " + str(word_dict[word]) + "\n")
        csv_output.write(date_str[4:15] + "," + date_str[16:34] + "," + word + "," + str(word_dict[word]) + "\n")
        print(str(count) + ". " + word + " " + str(word_dict[word]))
        count = count + 1
        if count == 11:
            return

initial_data = spark.read.json('/input/output_tweets.json')
total_rows = initial_data.count()
tweet_count = 0
# File for formatted output
hashtag_file = open('hashtags_results.txt', 'w')
user_file = open('users_results.txt', 'w')
count_file = open('count_results.txt', 'w')
keyword_file = open('keyword_results.txt', 'w')
# File for csv data
hashtag_csv = open('hashtags_results.csv', 'w')
user_csv = open('users_results.csv', 'w')
count_csv = open('count_results.csv', 'w')
keyword_csv = open('keyword_results.csv', 'w')
# Column names
count_csv.write("date_created,time_created,word,count\n")
keyword_csv.write("date_created,time_created,keyword,count\n")
hashtag_csv.write("date_created,time_created,hashtag,count\n")
user_csv.write("created_date,time_created,username,tweets_posted\n")
# Function for converting created_at date string to created timeStamp type
date_converter = udf(lambda x: datetime.strptime(x[0:20] + x[26:len(x)], "%a %b %d %H:%M:%S %Y"), TimestampType())
# Function for adding hashtags as column
hashtag_extractor = udf(hashtagExtractor)
# Function gets full tweet
full_text_extractor = udf(getFullText)
# Function that gets user name
username_extractor = udf(lambda x: x['screen_name'])
# Create new RDD with date column for when the data was created
tweets_df = initial_data.withColumn('created_date', date_converter(initial_data['created_at'])).withColumn('hashtags', hashtag_extractor(initial_data['entities']['hashtags'])).withColumn('full_text', full_text_extractor(initial_data['retweeted_status'], initial_data['quoted_status'], initial_data['text'], initial_data['extended_tweet'])).withColumn('username', username_extractor(initial_data['user']))
# The tweets obtained in output_tweets.json are in order of how they were found
# so the first tweet in the data is also the oldest tweet in the data, the last tweet
# will be the newest tweet
first_tweet_created_date = tweets_df.first()['created_date']
# Set first hour to check for data
start_created_date = first_tweet_created_date - timedelta(minutes=first_tweet_created_date.minute,
                                                          seconds=first_tweet_created_date.second)
# One hour after start date
one_hour_end_date = start_created_date + timedelta(minutes=59, seconds=59)
# 12 hours after start date
twelve_hour_end_date = start_created_date + timedelta(hours=11, minutes=59, seconds=59)

while tweet_count < total_rows:
    # Get all the tweets in this one hour interval
    tweets_one_hour = tweets_df.select('id', 'hashtags', 'username', 'full_text').filter(tweets_df['created_date'] >= start_created_date).filter(tweets_df['created_date'] <= one_hour_end_date)
    # Get all the tweets in this 12 hour interval
    tweets_twelve_hours = tweets_df.select('id', 'hashtags', 'username', 'full_text').filter(tweets_df['created_date'] >= start_created_date).filter(tweets_df['created_date'] <= twelve_hour_end_date)
    # Get date string for one hour
    one_hour_str = start_created_date.strftime("%a %b %d %Y %H:%M:%S") + "-" + one_hour_end_date.strftime("%H:%M:%S")
    # Get date string for 12 hours
    twelve_hour_str = start_created_date.strftime("%a %b %d %Y %H:%M:%S") + "-" + twelve_hour_end_date.strftime("%H:%M:%S")
    # Get list of the texts of each tweet
    tweet_texts = tweets_one_hour.select('full_text').collect()
    if tweets_one_hour.count() != 0:
        # Print top ten keywords in the last hour
        getKeywords(tweet_texts, keyword_file, keyword_csv, one_hour_str)
        # Print the occurence of certain words
        countWords(tweet_texts, count_file, count_csv, one_hour_str)
        # Get list of all the hashtags
        hashtags = tweets_one_hour.select('hashtags').collect()
        # Print the top 10 trending hashtags in the last hour
        getTrendingHashtags(hashtags, hashtag_file, hashtag_csv, one_hour_str)
    if tweets_twelve_hours.count() != 0:
        # Get the users and count them. Order them in ascending order of the number of tweets they have posted
        tweets_twelve_hours.createOrReplaceTempView("tweet")
        users = spark.sql("select username, count(username) as tweets_posted from tweet "
                          "group by username order by tweets_posted")
        user_file.write("Top ten participants of " + str(users.count()) + " at " + twelve_hour_str + "\n")
        print("Top ten participants of " + str(users.count()) + " at " + twelve_hour_str)
        users.show(10)
        user_list = users.collect()
        i = 1
        for user in user_list:
            user_csv.write(twelve_hour_str[4:15] + "," + twelve_hour_str[16:34] + "," + user['username'] + "," + str(user['tweets_posted']) + "\n")
            user_file.write(str(i) + ". " + user['username'] + " " + str(user['tweets_posted']) + "\n")
            i = i + 1
            if i >= 11:
                break
    # Count how many tweets have been handled
    tweet_count = tweet_count + tweets_one_hour.count()
    # Update time intervals
    start_created_date = start_created_date + timedelta(hours=1)
    # One hour after start date
    one_hour_end_date = one_hour_end_date + timedelta(hours=1)
    # 12 hours after start date
    twelve_hour_end_date = twelve_hour_end_date + timedelta(hours=1)
