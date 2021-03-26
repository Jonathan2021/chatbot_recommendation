import sys
import pandas as pd
from fastai.tabular.all import load_pickle
import torch
import numpy as np

def get_book_id(title, series=None, authors=None):
    lookup_id = pd.read_csv('save/book_lookup.csv')
    title_msk = lookup_id['title'] == title
    series_msk = np.repeat(True, len(lookup_id)) if series is None else lookup_id['series'].isna() if not series else lookup_id['series'] == series
    author_msk = np.repeat(True, len(lookup_id)) if authors is None else lookup_id['authors'] == authors
    book_id = lookup_id[title_msk & series_msk & author_msk].book_id
    if len(book_id) == 0:
        exit(1) # No corresponding book
    elif len(book_id) > 1:
        exit(2) # More than 1 corresponding book

    print(book_id)
    return book_id[0]

def get_similar_book(title, series=None, authors=None, nb_books=15):
    book_id = get_book_id(title, series, authors)
    factors = load_pickle('save/book_factors.pkl')
    distances = torch.nn.CosineSimilarity(dim=1)(factors, factors[book_id][None])
    idx = distances.argsort(descending=True)[1: nb_books + 1]
    idx = idx[1: nb_books + 1]
    titles = pd.read_csv('save/titles_by_book_id.csv', header=None)[0].values
    return list(titles[idx])

def get_similar_user(user_id, nb_user=6):
    user_id = int(user_id)
    factors = load_pickle('save/user_factors.pkl')
    distances = torch.nn.CosineSimilarity(dim=1)(factors, factors[user_id][None])
    idx = distances.argsort(descending=True)[1: nb_user + 1].numpy()
    return list(idx)


def get_book_avg(author, pub_year, language_code, genres="", series=None, volume_number=1):
    genres = genres.split(',')
    model = load_pickle('save/avg_rating_nn.pkl')
    all_genres = pd.read_csv('save/genres.csv', header=None)[0].values
    row = {genre: False for genre in all_genres}
    for genre in genres:
        row[genre] = True
    row["authors"] = author
    row["original_publication_year"] = int(pub_year)
    row["language_code"] = language_code
    row["series"] = series
    row["volume_number"] = volume_number
    *_, rating = model.predict(pd.Series(row))
    return rating.item()

def get_rating_user_book(user_id, title, series=None, authors=None):
    user_id = int(user_id)
    book_id = get_book_id(title, series, authors)
    model = load_pickle('save/nn_collab.pkl')
    data = pd.read_csv('save/book_nn_data.csv')
    data.set_index('book_id', drop = False, inplace=True)

    row = data.loc[[book_id]].copy()
    row['user_id'] = user_id
    
    dl = model.dls.test_dl(row)

    rating, _= model.get_preds(dl=dl)
    return rating.item()


def get_function(fn_id):
    fns = {1: get_similar_book,
            2: get_similar_user,
            3: get_book_avg,
            4: get_rating_user_book
        }
    return fns[fn_id]

def main():
    args = sys.argv
    if len(args) == 1:
        exit(4)
    fn = get_function(int(args[1]))
    res = fn(*args[2:])
    print(res, end="")

main()
