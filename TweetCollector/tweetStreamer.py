import json
from twitter import OAuth, TwitterError, TwitterStream
import time
import sys
import linecache


def get_credentials():
    try:
        # Get credentials from json
        with open("credentials.json") as cred:
            return json.load(cred)
    except:
        print("Credentials file not found\n")
        exc_type, exc_obj, tb = sys.exc_info()
        f = tb.tb_frame
        lineno = tb.tb_lineno
        filename = f.f_code.co_filename
        linecache.checkcache(filename)
        line = linecache.getline(filename, lineno, f.f_globals)
        print('EXCEPTION IN ({}, LINE {} "{}"): {}'.format(filename, lineno, line.strip(), exc_obj))
        return None


if __name__ == "__main__":
    # Get credentials
    credentials = get_credentials()
    output_file = open("output_tweets.json", "a")
    # Get authentication
    auth = OAuth(credentials["ACCESS_TOKEN"], credentials["ACCESS_SECRET"],
                 credentials["CONSUMER_KEY"], credentials["CONSUMER_SECRET"])
    print("Start getting tweets")
    # Set up twitter stream
    keywords = ['Flu', 'Zika', 'Ebola', 'Diarrhea', 'Headache', 'Measles', 'flu', 'zika', 'ebola', 'diarrhea', 'headache', 'measles']
    while True:
        try:
            stream = TwitterStream(auth=auth, secure=True)
            tweets = stream.statuses.filter(track=keywords)
            for tweet in tweets:
                output_file.write(json.dumps(tweet) + "\n")
                # Display some tweet information
                print(json.dumps(tweet))
                print("ID: " + str(tweet["id"]))
                print("User: " + str(tweet["user"]["screen_name"]))
                print("Text: " + str(tweet["text"]))
        except TwitterError as e:
            # If limit is reached wait 5 minutes
            print(e)
            time.sleep(300)
        except KeyboardInterrupt:
            print("Program killed")
            output_file.close()
            break
        except Exception as e:
            exc_type, exc_obj, tb = sys.exc_info()
            f = tb.tb_frame
            lineno = tb.tb_lineno
            filename = f.f_code.co_filename
            linecache.checkcache(filename)
            line = linecache.getline(filename, lineno, f.f_globals)
            output_file.close()
            print('EXCEPTION IN ({}, LINE {} "{}"): {}'.format(filename, lineno, line.strip(), exc_obj))
            print("NOT WORKING!")
            break

    print("Done")
